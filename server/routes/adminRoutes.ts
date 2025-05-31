import Router from 'express';
import {createAdmin} from '../controllers/admin/createAdmin.js';

const router = Router();

// Admin Routes
router.post('/createAdmin', createAdmin);

export default router;