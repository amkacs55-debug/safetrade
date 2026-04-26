
# PHP 8.2 + Apache base image
FROM php:8.2-apache

# System dependencies суулгах
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libcurl4-openssl-dev \
    unzip \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions суулгах (Supabase + QPay)
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    curl

# Apache mod_rewrite enable хийх (ихэнх framework-д хэрэгтэй)
RUN a2enmod rewrite

# Working directory
WORKDIR /var/www/html

# Project файлууд copy хийх
COPY . .

# Permission засах (optional)
RUN chown -R www-data:www-data /var/www/html

# Port
EXPOSE 80

# Apache start
CMD ["apache2-foreground"]
