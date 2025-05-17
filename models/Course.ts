import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  courseId: { type: String, required: true },  
  level: { type: Number, required: true },
  dateCreated: { type: Date, required: true },
  exerciseBatchList: { type: [String], required: true },
});
const Course = mongoose.model('Course', courseSchema);
export default Course;


