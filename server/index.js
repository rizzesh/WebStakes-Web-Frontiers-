const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Helper to mask anonymous users
const maskUser = (item) => {
  if (item.is_anonymous) {
    return {
      ...item,
      author: {
        id: 'anon',
        username: 'Anonymous',
        avatar: 'https://i.pravatar.cc/150?u=anon'
      }
    };
  }
  return item;
};

// 1. GET Posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: { id: true, username: true, avatar: true }
        },
        _count: {
          select: { comments: true }
        }
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(posts.map(maskUser));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve posts' });
  }
});

// 2. GET Single Post with comments
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        author: {
          select: { id: true, username: true, avatar: true }
        },
        comments: {
          include: {
            author: { select: { id: true, username: true, avatar: true } }
          },
          orderBy: { created_at: 'asc' }
        }
      }
    });

    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Mask the post if anonymous
    const maskedPost = maskUser(post);
    // Mask comments if anonymous
    maskedPost.comments = maskedPost.comments.map(maskUser);

    res.json(maskedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve post' });
  }
});

// 3. POST Create a Post
app.post('/api/posts', async (req, res) => {
  try {
    const { title, text_content, image_url, wing_id, is_main_feed, is_anonymous, author_email, author_alias, avatar } = req.body;
    
    let dbUser = await prisma.user.findUnique({ where: { email: author_email || 'mock@iiitl.ac.in' } });
    if (!dbUser && author_email) {
       dbUser = await prisma.user.create({
          data: {
             email: author_email,
             alias: author_alias || 'Unknown',
             avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${author_alias}`
          }
       });
    }

    const newPost = await prisma.post.create({
      data: {
        title,
        text_content,
        image_url,
        wing_id,
        is_main_feed: is_main_feed || false,
        is_anonymous: is_anonymous || false,
        author_id: dbUser ? dbUser.id : 1
      },
      include: {
        author: { select: { id: true, username: true, alias: true, avatar: true, email: true } },
        _count: { select: { comments: true } }
      }
    });

    res.status(201).json(maskUser(newPost));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// 4. POST Create a Comment
app.post('/api/comments', async (req, res) => {
  try {
    const { post_id, text_content, parent_comment_id, is_anonymous, author_email, author_alias, avatar } = req.body;
    
    let dbUser = await prisma.user.findUnique({ where: { email: author_email || 'mock@iiitl.ac.in' } });
    if (!dbUser && author_email) {
       dbUser = await prisma.user.create({
          data: {
             email: author_email,
             alias: author_alias || 'Unknown',
             avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${author_alias}`
          }
       });
    }

    const newComment = await prisma.comment.create({
      data: {
        post_id: Number(post_id),
        text_content,
        parent_comment_id: parent_comment_id ? Number(parent_comment_id) : null,
        is_anonymous: is_anonymous || false,
        author_id: dbUser ? dbUser.id : 1
      },
      include: {
        author: { select: { id: true, username: true, alias: true, avatar: true, email: true } }
      }
    });

    res.status(201).json(maskUser(newComment));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// 5. PATCH Update Profile
app.patch('/api/users/profile', async (req, res) => {
  try {
    const { email, avatar } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await prisma.user.upsert({
      where: { email },
      update: { avatar },
      create: {
         email,
         alias: email.split('@')[0],
         avatar
      }
    });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
