import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true },
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Subscriber', subscriberSchema);
