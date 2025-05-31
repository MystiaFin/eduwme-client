import Router from 'express';
import {createAdmin} from '../controllers/admin/createAdmin.js';

const router = Router();

router.post('/createAdmin', createAdmin);

export default router;