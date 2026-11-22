# CodeVia

CodeVia Academy üçün təhsil idarəetmə sistemi (LMS). Layihə üç ayrı panel — **tələbə**, **müəllim** və **admin** — üzərində qurulub və kursa qoşulmadan dərs keçməyə qədər bütün axını əhatə edir.

## Texnologiyalar

- **React 19** + **TypeScript** (strict rejim)
- **Vite** (build və dev server)
- **Tailwind CSS 3** — CSS dəyişənləri ilə gündüz/gecə rejimi
- **Redux Toolkit** + **RTK Query** (`fakeBaseQuery` ilə simulyasiya olunmuş backend)
- **React Router v7** — rol əsaslı qorunan marşrutlar
- **lucide-react** (ikonlar), **recharts** (qrafiklər)

Məlumatlar brauzerin `localStorage` yaddaşında saxlanılır, ayrıca backend tələb olunmur.

## İşə salma

```bash
npm install
npm run dev
```

Digər əmrlər:

```bash
npm run build     # production build
npm run preview   # build-i lokal yoxlamaq
```

## Test hesablar

| Rol | E-poçt | Şifrə |
| --- | --- | --- |
| Tələbə | `student@codevia.az` | `student123` |
| Müəllim | `teacher@codevia.az` | `teacher123` |
| Administrator | `admin@codevia.az` | `admin123` |

Giriş səhifəsindəki düymələr vasitəsilə bu hesabların məlumatlarını bir kliklə doldurmaq mümkündür.

## Əsas funksiyalar

### Ümumi

- Gündüz/gecə rejimi, seçim yadda saxlanılır
- Rol əsaslı qeydiyyat: **tələbə** və ya **müəllim** paneli üçün ayrı-ayrı axın
- Profil şəkli yükləmə və silmə (bütün panellərdə)

### Tələbə

- Kurslara baxış, axtarış və filtr
- Kursa qoşulma axını: qəbul testi → paket → qrup/fərdi tədris → onlayn/oflayn/hibrid → tarix və qrup seçimi → birbaşa ödəniş
- Ödəniş zamanı başqa kurs seçmək imkanı
- Dərs videoları (YouTube), cədvəl, qiymətlər və ödəniş tarixçəsi
- Şəxsi kabinet və profil idarəetməsi

### Müəllim

- Kurs yaratma və redaktə, dərslərin idarə edilməsi
- Tələbə siyahısı, cədvəl və gəlir hesabatı
- Peşəkar profil: ixtisas, təcrübə, saatlıq haqqı, təhsil, bacarıqlar, dillər

### Admin

- İdarə paneli və analitika
- İstifadəçilərin idarə edilməsi və rolların təyini
- **Müəllim müraciətlərinin təsdiqi**: CV-yə baxış, təsdiq və ya rədd. Müəllim yalnız təsdiqdən sonra sistemə daxil ola bilər
- Kursların, qeydiyyatların və ödənişlərin idarə edilməsi
- Sistem parametrləri

## Qovluq strukturu

```
src/
  app/            Redux store və tipləşdirilmiş hook-lar
  components/
    common/       Ümumi komponentlər (profil şəkli, statistika kartları, tema düyməsi)
    layout/       Public və idarə paneli layout-ları
    ui/           Dizayn sistemi (Button, Input, Modal, Badge və s.)
  data/           Nümunə məlumatlar və localStorage verilənlər bazası
  features/       apiSlice, authSlice, uiSlice
  lib/            Köməkçi funksiyalar və sabitlər
  pages/
    public/       Ana səhifə, kurslar, müəllimlər, qeydiyyat, giriş
    student/      Tələbə paneli
    teacher/      Müəllim paneli
    admin/        Admin paneli
  types/          TypeScript tipləri
```

## Marşrutlar

| Marşrut | Səhifə |
| --- | --- |
| `/` | Ana səhifə |
| `/kurslar` | Kurs siyahısı |
| `/kurslar/:courseId` | Kurs detalları |
| `/kurslar/:courseId/qeydiyyat` | Kursa qoşulma |
| `/muellimler` | Müəllimlər |
| `/muellimler/:id` | Müəllim profili |
| `/giris`, `/qeydiyyat` | Giriş və qeydiyyat |
| `/panel/telebe` | Tələbə paneli |
| `/panel/muellim` | Müəllim paneli |
| `/panel/admin` | Admin paneli |
