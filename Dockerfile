# 1. PHP 8.2 болон Apache сервер ашиглана
FROM php:8.2-apache

# 2. Системийн хамааралтай сангуудыг суулгах (cURL болон SSL-д зориулав)
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    pkg-config \
    libssl-dev \
    && docker-php-ext-install curl pdo pdo_mysql

# 3. Apache-ийн mod_rewrite модулийг идэвхжүүлэх (URL-ийг зөв ажиллуулахад хэрэгтэй)
RUN a2enmod rewrite

# 4. Кодуудыг Apache-ийн ажиллах хавтас руу хуулах
COPY . /var/www/html/

# 5. Хавтасны эрхийг тохируулах (Render дээр алдаа гарахаас сэргийлнэ)
RUN chown -R www-data:www-data /var/www/html

# 6. Render-ийн портыг тодорхойлох (Стандарт 80-р порт)
EXPOSE 80

# 7. Apache-г үндсэн горимоор ажиллуулах
CMD ["apache2-foreground"]
