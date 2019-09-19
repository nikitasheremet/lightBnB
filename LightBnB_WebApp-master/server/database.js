const properties = require('./json/properties.json');
const users = require('./json/users.json');
const db = require('./db')

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return db.query(`
  SELECT *
  FROM users
  WHERE users.email = $1;
  `, [email]).then(res => {
    return res.rows[0];
  });
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return db.query(`
  SELECT *
  FROM users
  WHERE users.id = $1;
  `, [id]).then(res => {
    return res.rows[0];
  });
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  console.log(user);
  values = [user.name, user.email, user.password]
  return db.query(`
  INSERT INTO users (name, email, password)
  VALUES ($1,$2,$3)
  RETURNING *;
  `, values).then(res => res.rows[0]);
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
return db.query(`
SELECT reservations.*, properties.*
FROM reservations
JOIN users ON reservations.guest_id = users.id
JOIN properties ON reservations.property_id = properties.id
WHERE users.id = $1
LIMIT $2;
`, [guest_id, limit]).then(res => res.rows);
  // return getAllProperties(null, 2);
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }
  if (options.owner_id) {
    queryParams.push(options.owner_id);
    queryString += `\nWHERE owner_id = $${queryParams.length} `;
  }
  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night);
    queryString += `\nWHERE cost_per_night >= $${queryParams.length}`;
  }
  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night);
    queryString += `\nWHERE cost_per_night <= $${queryParams.length}`;
  }
  queryString += `\nGROUP BY properties.id`;

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `\nHAVING avg(property_reviews.rating) >= $${queryParams.length} `;
  }

  // 4
  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5
  queryString = queryString.replace(/WHERE/gi,'AND').replace(/AND/, 'WHERE');
  console.log(queryString, queryParams);

  // 6

  return db.query(queryString, queryParams)
  .then(res => {
    console.log(res.rows);
    return res.rows;
  });
}
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  values = [property.owner_id,property.title,property.description,property.thumbnail_photo_url,property.cover_photo_url,property.cost_per_night,property.street,property.city,property.province,property.post_code,property.country,property.parking_spaces,property.number_of_bathrooms,property.number_of_bedrooms];
  return db.query(`
  INSERT INTO properties
  (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms)
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
  RETURNING *;
  `, values).then(res => {
    console.log(res.rows);
    return res.rows;
  });
}
exports.addProperty = addProperty;