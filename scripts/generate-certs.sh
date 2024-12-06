#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print messages
print_message() {
    echo -e "${GREEN}==>${NC} $1"
}

print_error() {
    echo -e "${RED}==>${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}==>${NC} $1"
}

# Check if mkcert is installed
check_mkcert() {
    if ! command -v mkcert &> /dev/null; then
        print_error "mkcert is not installed"
        
        # Check the operating system
        if [[ "$OSTYPE" == "darwin"* ]]; then
            print_message "Installing mkcert using Homebrew..."
            brew install mkcert
            brew install nss # for Firefox support
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            print_message "Please install mkcert using your package manager:"
            print_message "Ubuntu/Debian: sudo apt install mkcert"
            print_message "Fedora: sudo dnf install mkcert"
            exit 1
        elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
            print_message "Please install mkcert using Chocolatey:"
            print_message "choco install mkcert"
            exit 1
        else
            print_error "Unsupported operating system"
            exit 1
        fi
    fi
}

# Create certificates directory if it doesn't exist
create_certs_dir() {
    if [ ! -d "certs" ]; then
        print_message "Creating certs directory..."
        mkdir certs
    else
        print_message "Certs directory already exists"
    fi
}

# Generate certificates
generate_certs() {
    cd certs
    
    # Check if certificates already exist
    if [ -f "localhost+2.pem" ] && [ -f "localhost+2-key.pem" ]; then
        print_warning "Certificates already exist. Do you want to regenerate them? (y/n)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]; then
            print_message "Regenerating certificates..."
            mkcert -install
            mkcert localhost 127.0.0.1 local.arshadshah.com
        else
            print_message "Using existing certificates"
        fi
    else
        print_message "Generating new certificates..."
        mkcert -install
        mkcert localhost 127.0.0.1 local.arshadshah.com
    fi
    
    cd ..
}

# Update .gitignore
update_gitignore() {
    if [ ! -f ".gitignore" ]; then
        print_message "Creating .gitignore file..."
        echo "certs/" > .gitignore
    elif ! grep -q "certs/" .gitignore; then
        print_message "Adding certs/ to .gitignore..."
        echo "certs/" >> .gitignore
    fi
}

# Main execution
main() {
    print_message "Starting local HTTPS certificate setup..."
    
    check_mkcert
    create_certs_dir
    generate_certs
    update_gitignore
    
    print_message "Certificate setup complete!"
    print_message "You can now use HTTPS in your Vite config with these settings:"
    echo
    echo "server: {"
    echo "  https: {"
    echo "    key: fs.readFileSync('./certs/localhost+2-key.pem'),"
    echo "    cert: fs.readFileSync('./certs/localhost+2.pem')"
    echo "  }"
    echo "}"
    echo
    print_message "Access your site at https://local.arshadshah.com:5173"
}

# Run main function
main