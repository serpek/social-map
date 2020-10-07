### STAGE 1: Build ###
FROM node:12.18.2 AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm cache clean --force
RUN npm i
COPY . .
RUN npm run build
### STAGE 2: Run ###
FROM nginx:1.19.0
COPY --from=build /usr/src/app/dist/social-map-app /usr/share/nginx/html
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
