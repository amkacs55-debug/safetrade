FROM php:8.2-apache

# System deps
RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev \
    libpq-dev zip unzip curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql pdo_mysql gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Apache modules
RUN a2enmod rewrite headers deflate

# AllowOverride All
RUN sed -i '/<Directory \/var\/www\/html>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' \
    /etc/apache2/apache2.conf

# Uploads dir
RUN mkdir -p /var/www/html/assets/uploads

# Copy files
COPY . /var/www/html/

# Permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 775 /var/www/html/assets/uploads

EXPOSE 80
CMD ["apache2-foreground"]

