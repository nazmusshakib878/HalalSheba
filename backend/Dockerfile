FROM php:8.2-cli-alpine

# Install system packages & PostgreSQL + SQLite support
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    postgresql-dev \
    sqlite-dev \
    oniguruma-dev \
    bash \
    icu-dev

RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pdo_mysql \
    pdo_sqlite \
    mbstring \
    pcntl \
    bcmath \
    gd \
    intl \
    opcache

# Increase PHP file upload and execution limits
RUN echo "upload_max_filesize = 32M" > /usr/local/etc/php/conf.d/uploads.ini && \
    echo "post_max_size = 36M" >> /usr/local/etc/php/conf.d/uploads.ini && \
    echo "memory_limit = 256M" >> /usr/local/etc/php/conf.d/uploads.ini && \
    echo "max_execution_time = 120" >> /usr/local/etc/php/conf.d/uploads.ini

# Get Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy dependency files first
COPY composer.json composer.lock ./

# Install dependencies without dev packages
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Copy application source
COPY . .

# Finish composer setup
RUN composer dump-autoload --optimize --no-dev

# Prepare entrypoint script
RUN chmod +x docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
