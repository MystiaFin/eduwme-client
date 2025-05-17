import mongoose from 'mongoose';

const courseBatchSchema = new mongoose.Schema({
  courseBatchId: { type: String, required: true },  
  dateCreated: { type: Date, required: true },
  courseList: { type: [String], required: true },
  stage: { type: Number, required: true },
});
const Course = mongoose.model('Course', courseBatchSchema);
export default Course;