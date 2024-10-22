FROM node:20-alpine
WORKDIR /usr
COPY package.json ./
COPY tsconfig.json ./
COPY . .
RUN ls -a
RUN npm install
RUN npm run build
## this is stage two , where the app actually runs
FROM node:20-alpine
WORKDIR /usr
COPY package.json ./
RUN npm install
COPY --from=0 /usr/build .
RUN npm install pm2 -g
EXPOSE 6002
CMD ["pm2-runtime","index.js"]