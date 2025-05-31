import mongoose from 'mongoose';

const courseBatchSchema = new mongoose.Schema({
  courseBatchId: { type: String, required: true, unique: true },  
  dateCreated: { type: Date, required: true },
  courseList: { type: [String], required: true },
  coursesLength: { type: Number, required: true },
  stage: { type: Number, required: true }, 
});

const CourseBatch = mongoose.model('CourseBatch', courseBatchSchema);
export default CourseBatch;