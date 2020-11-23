0. required:
   - server.csr.cnf
    ```
    [req]
    default_bits = 2048
    prompt = no
    default_md = sha256
    distinguished_name = dn

    [dn]
    C=US
    ST=New York
    L=Rochester
    O=End Point
    OU=Testing Domain
    CN = localhost-https
    emailAddress=your-administrative-address@your-awesome-existing-domain.com
    ```
    - v3.ext
    ```
    authorityKeyIdentifier=keyid,issuer
    basicConstraints=CA:FALSE
    keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
    subjectAltName = @alt_names

    [alt_names]
    DNS.1 = localhost-https
    ```

1. in powershell:
```powershell
openssl genrsa -des3 -out rootCA.key 2048
openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 1024 -out rootCA.pem -config .\server.csr.cnf
openssl req -new -sha256 -nodes -out server.csr -newkey rsa:2048 -keyout server.key -config .\server.csr.cnf
openssl x509 -req -in server.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out server.crt -days 500 -sha256 -extfile v3.ext
```

2. a. share from vscode:
    2.a.1. install LiveServer
    2.a.2. create `.vscode` folder
    2.a.3. create `settings.json`
    2.a.4. paste:
    ```json
    {
        "liveServer.settings.https":
        {
            "enable": true, //set it true to enable the feature.
            "cert": "C:\\certs\\server.crt", //full path of the certificate
            "key": "C:\\certs\\server.key", //full path of the private key
            "passphrase": "1234"
        },
        "liveServer.settings.port": 443
    }
    ```

2. b. share from docker
```dockerfile
FROM nginx:1.19.4-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY nginx.conf /etc/nginx/nginx.conf
COPY dist/. /usr/share/nginx/html
COPY certs/. /etc/ssl/
```
```yaml
version: '2'
services:
  angular:
    build:
      context: .
    ports:
      - "4443:443"
    volumes:
      - ./dist:/usr/share/nginx/html
```

4. in `C:\Windows\System32\drivers\etc\hosts` add:
```
# Added for test local https
127.0.0.1 localhost-https
# End of section
```

5. in mmc in local computer in Trusted Root Certificate Authorities import 'rootCA.pem`

6. go to: `https://localhost-https:4443/`
