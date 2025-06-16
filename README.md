# 🐳 Fullstack Docker Projesi

## 🧩 Proje Özeti

Bu proje, Docker tabanlı altyapıya sahip bir **fullstack web uygulamasıdır**. Aşağıdaki üç ana bileşenden oluşur:

### 📦 Backend (`/backend`)

* Node.js tabanlı API sunucusu
* Docker ile containerized
* Ortam dosyaları (`.env`, `.env.production`) ile yapılandırılabilir
* GitHub Actions kullanarak otomatik image push (CI) desteği
* `prod-up.sh` script’iyle production ortamına kolay kurulum

### 🎨 Frontend (`/frontend`)

* Vite + React + TypeScript temelli modern SPA (Single Page Application)
* Nginx ile servis edilir
* Docker ile paketlenmiştir
* GitHub Actions ile CI/CD pipeline’ı mevcuttur
* `prod-up.sh` script’i ile canlıya alma süreci kolaylaştırılmıştır

### 🌐 Reverse Proxy (`/nginx`)

* Tüm servisleri yöneten merkezi Nginx yapılandırması
* `prod-up.sh` ve `prod-down.sh` script’leri ile trafik yönetimi kolaylaştırılmıştır

---

## 🚀 Özellikler

* Tamamen **Docker Compose** tabanlı yapı (her bileşen kendi `docker-compose.yml` dosyasına sahip)
* Ortak **Docker ağı** üzerinden frontend ve backend container’ları arasında iletişim
* **Nginx reverse proxy** ile port yönetimi ve yönlendirme
* **CI/CD entegrasyonu** (GitHub Actions)
* Production & development ortamlarını ayıran `.env` dosyaları

---

## 🚀 Production Ortamını Başlatma

Projeyi production ortamında başlatmak için **yalnızca ana dizindeki** `prod-up.sh` script'ini çalıştırmanız yeterlidir:

```bash
./prod-up.sh
```

Bu script, aşağıdaki işlemleri sırayla gerçekleştirir:

* Ortak Docker ağı oluşturur (varsa atlanır)
* `backend`, `frontend` ve `nginx` servislerini ayrı `docker-compose.yml` dosyaları üzerinden başlatır
* Gerekirse ilgili imajları build eder ve Docker Hub'a push eder (her servis kendi içinde)

---

### ⚙️ Her Servisi Ayrı Ayrı Production'a Göndermek İçin

Aşağıdaki script'ler ilgili servisi **tek başına** production ortamına gönderir:

| Servis       | Script Konumu           | Açıklama                           |
| ------------ | ----------------------- | ---------------------------------- |
| **Backend**  | `./backend/prod-up.sh`  | API sunucusunu build edip başlatır |
| **Frontend** | `./frontend/prod-up.sh` | React tabanlı SPA’yı başlatır      |
| **Nginx**    | `./nginx/prod-up.sh`    | Reverse proxy servisini başlatır   |

> 💡 Bu script'ler, ana dizindeki `prod-up.sh` içinde zaten çağrılmaktadır. Ancak, servisleri tek tek yeniden başlatmak veya CI/CD sırasında parçalı deploy yapmak için kullanılabilirler.

---
# 🧱 Subdomain Tanımlamaları (Hosts Dosyası)
Local ortamda subdomain’lerin doğru çalışabilmesi için hosts dosyasına aşağıdaki satırları ekleyin:

## 🪟 Windows:
1. Not Defteri’ni yönetici olarak aç
2. Dosya → Aç → C:\Windows\System32\drivers\etc\hosts yolunu aç
3. Dosyanın en altına şunları ekleyin:

```bash
127.0.0.1 admin.dreamchat.local
127.0.0.1 chat.dreamchat.local
127.0.0.1 api.dreamchat.local
```

Kaydedin ve tarayıcınızı yeniden başlatın.

---

## ☁️ MongoDB Yedekleme & Geri Yükleme Notları

### 📦 Konteynerden Dosya Kopyalama

```bash
docker cp container_name:/backup ./local_backup
docker cp dreamchat-mongo-backup:/backup ./local_backup
```

Windows'ta çıktı konumu:

```plaintext
C:\Users\Etchellon\local_backup
```

> Bu komutlar, konteynerdeki `/backup` klasörünü localimizdeki `./local_backup` klasörüne kopyalar.

---

### 🔧 Konteyner İçerisine Erişim

```bash
docker exec -it my_container sh
docker exec -it dreamchat-mongo sh
```

---

### ☁️ MongoDB Yedek Alma

Tüm Mongo veritabanlarının yedeğini almak için:

```bash
mongodump --uri=mongodb://mongo:27017 --out=/backup/<yedek_klasörü_adı>
```

Sadece belirli bir veritabanının yedeğini almak için:

```bash
mongodump --uri=mongodb://mongo:27017/dreamchat --out=/backup/<yedek_klasörü_adı>
```

---

### 📦 Konteyner İçinde Manuel Yedek Alma

Test amaçlı sabit isimli yedek:

```bash
docker exec dreamchat-mongo-backup sh -c "mongodump --uri=mongodb://mongo:27017/dreamchat --out=/backup/manual_test"
```

---

### 🔁 MongoDB Yedeği Geri Yükleme

Tüm veritabanlarını geri yüklemek için:

```bash
mongorestore --uri="mongodb://localhost:27017" /backup/20250614_000000
```

Sadece belirli bir veritabanını geri yüklemek için:

```bash
mongorestore --uri="mongodb://localhost:27017" --db=dreamchat /backup/20250614_000000/dreamchat
```

# Load Balance Kontrolü

```bash
docker logs dreamchat-proxy

{ "nginx_timestamp": "2025-06-16T06:27:02+00:00", "remote_addr": "172.23.0.1", "connection": "558", "connection_requests": "1", "pipe": ".", "body_bytes_sent": "24", "request_length": "428", "request_time": "0.003", "response_status": "200", "request": "/whoami", "request_method": "GET", "host": "api.dreamchat.local", "upstream_cache_status": "", "upstream_addr": "172.23.0.5:5000", "http_x_forwarded_for": "", "http_referrer": "http://admin.dreamchat.local/", "http_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36", "http_version": "HTTP/1.1", "remote_user": "", "http_x_forwarded_proto": "", "upstream_response_time": "0.003", "request_body": "", "nginx_access": true, "limit_req_status": "PASSED" }

{ "nginx_timestamp": "2025-06-16T06:27:03+00:00", "remote_addr": "172.23.0.1", "connection": "560", "connection_requests": "1", "pipe": ".", "body_bytes_sent": "0", "request_length": "563", "request_time": "0.001", "response_status": "304", "request": "/", "request_method": "GET", "host": "chat.dreamchat.local", "upstream_cache_status": "", "upstream_addr": "172.23.0.6:80", "http_x_forwarded_for": "", "http_referrer": "", "http_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36", "http_version": "HTTP/1.1", "remote_user": "", "http_x_forwarded_proto": "", "upstream_response_time": "0.000", "request_body": "", "nginx_access": true, "limit_req_status": "" }

{ "nginx_timestamp": "2025-06-16T06:27:04+00:00", "remote_addr": "172.23.0.1", "connection": "558", "connection_requests": "2", "pipe": ".", "body_bytes_sent": "24", "request_length": "426", "request_time": "0.004", "response_status": "200", "request": "/whoami", "request_method": "GET", "host": "api.dreamchat.local", "upstream_cache_status": "", "upstream_addr": "172.23.0.4:5000", "http_x_forwarded_for": "", "http_referrer": "http://chat.dreamchat.local/", "http_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36", "http_version": "HTTP/1.1", "remote_user": "", "http_x_forwarded_proto": "", "upstream_response_time": "0.003", "request_body": "", "nginx_access": true, "limit_req_status": "PASSED" }

{ "nginx_timestamp": "2025-06-16T06:27:05+00:00", "remote_addr": "172.23.0.1", "connection": "564", "connection_requests": "1", "pipe": ".", "body_bytes_sent": "0", "request_length": "414", "request_time": "0.003", "response_status": "304", "request": "/whoami", "request_method": "GET", "host": "api.dreamchat.local", "upstream_cache_status": "", "upstream_addr": "172.23.0.5:5000", "http_x_forwarded_for": "", "http_referrer": "http://localhost:3001/", "http_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36", "http_version": "HTTP/1.1", "remote_user": "", "http_x_forwarded_proto": "", "upstream_response_time": "0.003", "request_body": "", "nginx_access": true, "limit_req_status": "PASSED" }
```
---
# 🧪 Rate Limit & Load Balancing Testi

## 🎯 Test Komutları
### Subdomain’siz test:
```bash
docker run --rm jordi/ab -n 200 -c 20 http://host.docker.internal/api/whoami

```

### Subdomain ile test:

```bash
docker run --rm jordi/ab -n 1000 -c 200 -H "Host: api.dreamchat.local" http://host.docker.internal/
```

### Log Çıktıları:
* limit_req_status: İsteğin rate limit'e takılıp takılmadığını belirtir.
    * **"PASSED"** → İstek başarılı şekilde geçti
    * **"REJECTED"** → Rate limit nedeniyle reddedildi
* upstream_addr: İsteği karşılayan backend container’ın iç IP adresini gösterir. Bu değer sayesinde, istekleri hangi container’ın yanıtladığını anlayabilirsiniz.
    * **docker inspect container_name** : Komutu ile containerin hangi ip yi kullandığını görebilirsiniz.
    ```bash
            "Networks": {
                "dreamchat-network": {
                    "IPAMConfig": null,
                    "Links": null,
                    "Aliases": [
                        "dreamchat-backend",
                        "backend"
                    ],
                    "MacAddress": "4a:6b:07:a2:76:19",
                    "DriverOpts": null,
                    "GwPriority": 0,
                    "NetworkID": "0dc14f269449cf50c3a6c0cd4d32235ea98582cab90a7eabe161499c7d604869",
                    "EndpointID": "8a8f897279bddf07953ebc38c46bdf31356b9d7a13c84923f7decbe3f7e63842",
                    "Gateway": "172.23.0.1",
                    "IPAddress": "172.23.0.4",
                    "IPPrefixLen": 16,
                    "IPv6Gateway": "",
                    "GlobalIPv6Address": "",
                    "GlobalIPv6PrefixLen": 0,
                    "DNSNames": [
                        "dreamchat-backend",
                        "backend",
                        "85f68a6ebd40"
                    ]
                }
            }
     ```

```bash

{ "nginx_timestamp": "2025-06-16T06:26:34+00:00", "remote_addr": "172.23.0.1", "connection": "1", "connection_requests": "1", "pipe": ".", "body_bytes_sent": "27", "request_length": "87", "request_time": "0.073", "response_status": "200", "request": "/", "request_method": "GET", "host": "api.dreamchat.local", "upstream_cache_status": "", "upstream_addr": "172.23.0.4:5000", "http_x_forwarded_for": "", "http_referrer": "", "http_user_agent": "ApacheBench/2.3", "http_version": "HTTP/1.0", "remote_user": "", "http_x_forwarded_proto": "", "upstream_response_time": "0.073", "request_body": "", "nginx_access": true, "limit_req_status": "PASSED" }

{ "nginx_timestamp": "2025-06-16T06:26:34+00:00", "remote_addr": "172.23.0.1", "connection": "46", "connection_requests": "1", "pipe": ".", "body_bytes_sent": "18", "request_length": "87", "request_time": "0.000", "response_status": "429", "request": "/", "request_method": "GET", "host": "api.dreamchat.local", "upstream_cache_status": "", "upstream_addr": "", "http_x_forwarded_for": "", "http_referrer": "", "http_user_agent": "ApacheBench/2.3", "http_version": "HTTP/1.0", "remote_user": "", "http_x_forwarded_proto": "", "upstream_response_time": "", "request_body": "", "nginx_access": true, "limit_req_status": "REJECTED" }

{ "nginx_timestamp": "2025-06-16T06:26:34+00:00", "remote_addr": "172.23.0.1", "connection": "10", "connection_requests": "1", "pipe": ".", "body_bytes_sent": "18", "request_length": "87", "request_time": "0.000", "response_status": "429", "request": "/", "request_method": "GET", "host": "api.dreamchat.local", "upstream_cache_status": "", "upstream_addr": "", "http_x_forwarded_for": "", "http_referrer": "", "http_user_agent": "ApacheBench/2.3", "http_version": "HTTP/1.0", "remote_user": "", "http_x_forwarded_proto": "", "upstream_response_time": "", "request_body": "", "nginx_access": true, "limit_req_status": "REJECTED" }

{ "nginx_timestamp": "2025-06-16T06:56:51+00:00", "remote_addr": "172.23.0.1", "connection": "1", "connection_requests": "1", "pipe": ".", "body_bytes_sent": "24", "request_length": "414", "request_time": "0.009", "response_status": "200", "request": "/whoami", "request_method": "GET", "host": "api.dreamchat.local", "upstream_cache_status": "", "upstream_addr": "172.23.0.4:5000", "http_x_forwarded_for": "", "http_referrer": "http://localhost:3001/", "http_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36", "http_version": "HTTP/1.1", "remote_user": "", "http_x_forwarded_proto": "", "upstream_response_time": "0.010", "request_body": "", "nginx_access": true, "limit_req_status": "PASSED" }

{ "nginx_timestamp": "2025-06-16T06:56:57+00:00", "remote_addr": "172.23.0.1", "connection": "1", "connection_requests": "2", "pipe": ".", "body_bytes_sent": "24", "request_length": "414", "request_time": "0.004", "response_status": "200", "request": "/whoami", "request_method": "GET", "host": "api.dreamchat.local", "upstream_cache_status": "", "upstream_addr": "172.23.0.5:5000", "http_x_forwarded_for": "", "http_referrer": "http://localhost:3001/", "http_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36", "http_version": "HTTP/1.1", "remote_user": "", "http_x_forwarded_proto": "", "upstream_response_time": "0.004", "request_body": "", "nginx_access": true, "limit_req_status": "PASSED" }

```

---
