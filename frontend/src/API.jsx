/*
  API.jsx
  Essentially a file of helper funcitons.
*/

// Taken from assignment 2.
// Takes a file and returns a promise to the image.
export const fileToDataUrl = (file) => {
  const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg']
  const valid = validFileTypes.find(type => type === file.type);
  // Bad data, let's walk away.
  if (!valid) {
    throw Error('provided file is not a png, jpg or jpeg image.');
  }

  const reader = new FileReader();
  const dataUrlPromise = new Promise((resolve, reject) => {
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
  });
  reader.readAsDataURL(file);
  return dataUrlPromise;
}

// Allows multiple files to be converted to images.
export const multipleFileToDataUrl = (files) => {
  return Promise.all(Array.from(files).map(file => fileToDataUrl(file)));
}

// Given a list of reviews, calculates the average rating.
// If there are no current ratings, 0 is returned.
export const avgRating = (reviews) => {
  if (reviews.length === 0) {
    return 0;
  }

  let sum = 0;
  for (const review of reviews) {
    sum += parseInt(review.rating, 10);
  }
  return parseInt(sum / reviews.length, 10);
}

// Checks if the start date is before the end date
export const validDates = (start, end) => {
  return new Date(start) < new Date(end);
}

// Pretty print a date range
export const formatDateRange = (start, end) => {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }

  const d1 = new Date(start);
  const d2 = new Date(end);

  return d1.toLocaleDateString('en-GB', options) + ' - ' + d2.toLocaleDateString('en-GB', options);
}

// Pretty print a single date
export const formatDate = (date) => {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }

  const d1 = new Date(date);

  return d1.toLocaleDateString('en-GB', options);
}

// Given a status, returns a hex code
export const colorStatus = (status) => {
  if (status === 'pending') {
    return '#ff8561';
  } else if (status === 'accepted') {
    return '#449e65';
  } else {
    return '#e35e68';
  }
}
