FROM php:8.2-apache

# PostgreSQL холболтод хэрэгтэй сангуудыг суулгах
RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

# Төслийн бүх файлыг контейнер руу хуулах
COPY . /var/www/html/

# Apache серверт файл унших эрх өгөх
RUN chown -R www-data:www-data /var/www/html/

EXPOSE 80
