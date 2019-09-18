SELECT properties.city, COUNT(reservations.*) AS total_visits
FROM reservations
JOIN properties ON properties.id = reservations.property_id
GROUP BY properties.city
ORDER BY total_visits DESC;