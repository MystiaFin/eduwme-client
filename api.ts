import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import User from './models/User'; 

mongoose.connect('mongodb://localhost:27017/myapp')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const app = express();

dotenv.config()
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post('/register', async (req, res) => {
  const { username, password, confirm_password, email } = req.body;
  try {
    if (password !== confirm_password) {
      return res.status(400).json({ message: 'Passwords do not match' });    
    }
    
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const checkUsername = User.findOne({ username });
    if (checkUsername != null) {
        return res.status(400).json({ message: 'Account witht the same username already exists' });
    }

    const checkEmail = User.findOne({ email });
    if (checkEmail != null) {
        return res.status(400).json({ message: 'Account with the same email already exists' });
    }

    const newUser = new User({ id: Date.now(), username, password: hashedPassword });
    await newUser.save();

    
    res.status(201).json({ message: 'User registered successfully'});
  }
  catch (error) {
    return res.status(500).json({ error : error.message });
}
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        
        const user: InstanceType<typeof User> | null = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username' });
        }
        
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user.id }, 'secret', { expiresIn: '1h' });
        

        return res.status(200).json({ message: 'Login successful', token });

        }
    catch (error) {
        return res.status(500).json({ error : error.message });
    }
    
    });







