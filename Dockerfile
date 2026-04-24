# PHP-ийн хамгийн сүүлийн үеийн Apache-тай хувилбарыг ашиглана
FROM php:8.2-apache

# Шаардлагатай PHP extension-үүдийг суулгах (cURL, PDO, гэх мэт)
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    pkg-config \
    libssl-dev \
    && docker-php-ext-install curl pdo pdo_mysql

# Apache-ийн mod_rewrite-ийг идэвхжүүлэх (URL-ийг цэвэрхэн харагдуулахад хэрэгтэй)
RUN a2enmod rewrite

# Кодоо серверийн үндсэн хавтас руу хуулах
COPY . /var/www/html/

# Порт тохиргоо
EXPOSE 80

# Apache-г асаах
CMD ["apache2-foreground"]

