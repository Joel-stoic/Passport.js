import Stripe from 'stripe';
import dotenv from 'dotenv';
import Subscriber from '../models/Subscriber.js';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { price, productName, email } = req.body;

    if (!price || !productName || !email) {
      return res.status(400).json({ error: 'Missing price, productName, or email' });
    }

    const user = new Subscriber({ email, productName, price });
    await user.save();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: productName },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:${process.env.PORT}/success.html`,
      cancel_url: `http://localhost:${process.env.PORT}/cancel.html`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
};
