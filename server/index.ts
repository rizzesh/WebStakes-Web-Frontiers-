import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

import bcrypt from 'bcryptjs';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Strip sensitive fields from user objects
const sanitizeUser = (user: any) => {
  if (!user) return user;
  const { password, ...safe } = user;
  return safe;
};

// Auto-seed if empty
async function seed() {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('secret_password', 10);
      await prisma.user.create({
        data: {
          alias: 'CipherScholar_01',
          rollNumber: 'LCI2024001',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=LCI2024001',
          password: hashedPassword
        }
      });
      await prisma.wing.create({
        data: { id: 'general', name: 'General Chat', color: '#6366f1' }
      });
      console.log('Database seeded with initial mock data.');
    }
  } catch (e) {
    console.error('Seeding failed:', e);
  }
}
seed();

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { alias, password, rollNumber, name } = req.body;
    if (!alias || !rollNumber || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const existingAlias = await prisma.user.findUnique({ where: { alias } });
    if (existingAlias) return res.status(400).json({ error: 'Username (Alias) already exists' });
    
    const existingRoll = await prisma.user.findUnique({ where: { rollNumber } });
    if (existingRoll) return res.status(400).json({ error: 'Roll Number already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        alias,
        name,
        password: hashedPassword,
        rollNumber,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${rollNumber || Date.now()}`
      }
    });
    res.json(sanitizeUser(newUser));
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier is alias OR rollNumber
    if (!identifier || !password) return res.status(400).json({ error: 'Missing fields' });
    
    const user = await prisma.user.findFirst({ 
      where: { 
        OR: [
          { alias: identifier },
          { rollNumber: identifier }
        ]
      } 
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
    
    res.json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});


// Fetch posts including comments count
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: { 
        author: { select: { id: true, alias: true, name: true, rollNumber: true, avatar: true, xp: true, description: true } },
        _count: { select: { comments: true } } 
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Fetch full thread (Post + Comments)
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { 
         author: { select: { id: true, alias: true, name: true, rollNumber: true, avatar: true, xp: true, description: true } },
         comments: {
           include: { author: { select: { id: true, alias: true, name: true, rollNumber: true, avatar: true, xp: true, description: true } } }
         } 
      }
    });
    res.json(post);
  } catch(error) {
    res.status(500).json({ error: 'Failed to fetch thread' });
  }
});

// Create Post
app.post('/api/posts', async (req, res) => {
  try {
    const { title, text_content, wing_id, is_anonymous, alias } = req.body;
    
    // Auth user by alias
    const user = await prisma.user.findUnique({ where: { alias } });
    if (!user) return res.status(400).json({ error: 'User not registered' });

    const post = await prisma.post.create({
      data: {
        title, 
        text_content, 
        wing_id: wing_id || 'general', 
        is_anonymous: !!is_anonymous, 
        author_id: user.id,
      },
      include: { author: { select: { id: true, alias: true, name: true, rollNumber: true, avatar: true, xp: true, description: true } } }
    });
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Upvote Post
app.patch('/api/posts/:id/upvote', async (req, res) => {
  try {
    const { alias } = req.body;
    const post = await prisma.post.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!post) {
       return res.status(404).json({ error: 'Post not found' });
    }
    
    let trackers = JSON.parse(post.upvotedBy || "[]");
    if (trackers.includes(alias)) {
       return res.json(post); // Already upvoted
    }
    
    trackers.push(alias);
    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        upvotes: post.upvotes + 1,
        upvotedBy: JSON.stringify(trackers)
      }
    });
    
    res.json(updatedPost);
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Upvote failed' });
  }
});

// Mark Post as Solved
app.patch('/api/posts/:id/solve', async (req, res) => {
  try {
    const post = await prisma.post.update({
      where: { id: parseInt(req.params.id) },
      data: { is_solved: true }
    });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to solve post' });
  }
});

// Create Comment
app.post('/api/comments', async (req, res) => {
  try {
    const { post_id, text_content, is_anonymous, parent_comment_id, alias } = req.body;
    
    // Auth user by alias
    const user = await prisma.user.findUnique({ where: { alias } });
    if (!user) return res.status(400).json({ error: 'User not registered' });

    const comment = await prisma.comment.create({
      data: {
        post_id: parseInt(post_id),
        author_id: user.id,
        is_anonymous: !!is_anonymous,
        text_content,
        parent_comment_id: parent_comment_id ? parseInt(parent_comment_id) : null
      },
      include: { author: { select: { id: true, alias: true, name: true, rollNumber: true, avatar: true, xp: true, description: true } } }
    });
    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Delete Post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    await prisma.post.delete({
      where: { id: postId }
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Delete Comment
app.delete('/api/comments/:id', async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    await prisma.comment.delete({
      where: { id: commentId }
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Update User Profile
app.patch('/api/users/profile', async (req, res) => {
  try {
    const { alias, avatar, description, name } = req.body;
    if (!alias) return res.status(400).json({ error: 'Alias required' });

    const user = await prisma.user.update({
      where: { alias },
      data: { 
        avatar: avatar !== undefined ? avatar : undefined, 
        description: description !== undefined ? description : undefined,
        name: name !== undefined ? name : undefined
      }
    });
    
    res.json(sanitizeUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.listen(3001, () => {
  console.log('API running on http://localhost:3001');
});
