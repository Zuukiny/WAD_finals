# 1. Login as admin - should return Mina's user object, no password field
curl -s -X POST http://localhost:3000/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"password"}'

# 2. Login as guest - should return Norman's user object
curl -s -X POST http://localhost:3000/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"guest","password":"password"}'

# 3. Wrong password - should return 401
curl -s -i -X POST http://localhost:3000/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"wrong"}'

# 4. Get all locations - should return [] initially
curl -s http://localhost:3000/loc

# 5. Create a location - should return 201 + Location header + the new doc
curl -s -i -X POST http://localhost:3000/loc \
  -H 'Content-Type: application/json' \
  -d '{"name":"Missing bike lane","street":"Karl-Marx-Str","zip":"12043","city":"Berlin","category":"bike","lat":52.48,"lng":13.43}'

# 6. Get all locations again - should now show the one you just created
curl -s http://localhost:3000/loc