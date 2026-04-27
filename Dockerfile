FROM php:8.2-apache

# System dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev \
    zip unzip curl git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Apache mod_rewrite идэвхжүүлэх
RUN a2enmod rewrite headers deflate

# Apache DocumentRoot тохируулах
ENV APACHE_DOCUMENT_ROOT /var/www/html

# Apache config
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html|g' /etc/apache2/sites-available/000-default.conf \
    && echo '<Directory /var/www/html>\n\
    Options -Indexes +FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' >> /etc/apache2/sites-available/000-default.conf

# Uploads хавтас үүсгэх
RUN mkdir -p /var/www/html/assets/uploads \
    && chown -R www-data:www-data /var/www/html

# Код хуулах
COPY . /var/www/html/

# Зөвшөөрөл тохируулах
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 775 /var/www/html/assets/uploads

# Port
EXPOSE 80

CMD ["apache2-foreground"]

