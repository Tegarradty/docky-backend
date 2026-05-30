# Gunakan Node.js versi ringan
FROM node:18-alpine

# Tentukan folder kerja di dalam container
WORKDIR /app

# Salin file daftar package dan install
COPY package*.json ./
RUN npm install --production

# Salin seluruh sisa kode aplikasi
COPY . .

# Buka port 3000
EXPOSE 3000

# Perintah untuk menyalakan server
CMD ["node", "server.js"]