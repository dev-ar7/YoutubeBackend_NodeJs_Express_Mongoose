import crypto from 'crypto';

// Function to generate a random hex token
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate a token
const secretToken = generateToken();

// console.log('Generated Token:', secretToken);