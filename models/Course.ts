import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  courseBatchId: { type: String, required: true, unique: true },
  courseId: { type: String, required: true, unique: true },
  title: { type: String, required: true },  
  level: { type: Number, required: true },
  dateCreated: { type: Date, required: true },
  exerciseBatchList: { type: [String], required: true },
  exercisesLength: { type: Number, required: true },
});
const Course = mongoose.model('Course', courseSchema);
export default Course;


