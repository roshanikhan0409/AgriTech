require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/farms', require('./routes/farms'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/consultations', require('./routes/consultations'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/admin', require('./routes/admin'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
