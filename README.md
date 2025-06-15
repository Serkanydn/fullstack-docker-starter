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

172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.3:5000 [200]
172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.4:5000 [200]
172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.3:5000 [200]
172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.4:5000 [200]
172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.4:5000 [200]
172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.4:5000 [200]
172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.4:5000 [200]
```
---
# Rate Limit Testi
```bash
docker run --rm jordi/ab -n 100 -c 50 http://host.docker.internal/api/health
```

# Nginx Erişim Log Kontrolü
```bash
docker exec -it dreamchat-proxy tail -n 50 /var/log/nginx/access.log

172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.3:5000 [200]
172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.3:5000 [200]
172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.4:5000 [200]
172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.3:5000 [200]
172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.4:5000 [200]
172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.3:5000 [200]
172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.4:5000 [200]
172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.4:5000 [200]
172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.4:5000 [429]
172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.3:5000 [429]
172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.4:5000 [429]
172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.4:5000 [429]
172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.3:5000 [429]
172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.4:5000 [429]
172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.4:5000 [429]
172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.3:5000 [429]
172.23.0.1 - host.docker.internal "/api/health" -> 172.23.0.3:5000 [429]
```