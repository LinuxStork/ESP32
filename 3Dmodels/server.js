const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

