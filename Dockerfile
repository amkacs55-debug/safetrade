# PHP 8.2 болон Apache сервертэй албан ёсны base image-ийг ашиглах
FROM php:8.2-apache

# Системийн шаардлагатай сангуудыг суулгах (PostgreSQL болон cURL-д зориулсан)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libcurl4-openssl-dev \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Supabase болон QPay-д шаардлагатай PHP extension-уудыг суулгах
# postgresql, pdo_pgsql нь Supabase холболтод, curl нь QPay API дуудахад шаардлагатай
RUN docker-php-ext-install pdo pdo_pgsql pgsql curl

# Apache mod_rewrite асаах (URL routing хийхэд хэрэгтэй)
RUN a2enmod rewrite

# Үндсэн хавтсыг зааж өгөх
WORKDIR /var/www/html

# Төслийн бүх файлыг контейнер руу хуулах
COPY . /var/www/html/

# add_account.php дээрх зураг хуулах (upload) үйлдэлд зориулж хавтас үүсгэж, бичих эрх өгөх
RUN mkdir -p /var/www/html/assets/uploads/ \
    && chown -R www-data:www-data /var/www/html/assets/uploads/ \
    && chmod -R 755 /var/www/html/assets/uploads/

# 80 портыг нээх
EXPOSE 80

# Apache серверийг эхлүүлэх
CMD ["apache2-foreground"]
