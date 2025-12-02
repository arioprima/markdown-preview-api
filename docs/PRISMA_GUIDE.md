# 📚 Panduan Lengkap Prisma ORM

## Daftar Isi

1. [Apa itu ORM?](#apa-itu-orm)
2. [Prisma vs SQL Biasa](#prisma-vs-sql-biasa)
3. [Setup & Konfigurasi](#setup--konfigurasi)
4. [Schema Prisma](#schema-prisma)
5. [CRUD Operations](#crud-operations)
6. [Query Methods Lengkap](#query-methods-lengkap)
7. [Filtering & Kondisi](#filtering--kondisi)
8. [Relations (Relasi Antar Tabel)](#relations-relasi-antar-tabel)
9. [Pagination & Sorting](#pagination--sorting)
10. [Transactions](#transactions)
11. [Tips & Best Practices](#tips--best-practices)

---

## Apa itu ORM?

**ORM (Object-Relational Mapping)** adalah teknik untuk mengakses database menggunakan objek/kode, bukan SQL mentah.

### Tanpa ORM (SQL Biasa):

```sql
SELECT * FROM users WHERE email = 'john@mail.com' AND deleted_at IS NULL;
```

### Dengan ORM (Prisma):

```javascript
const user = await prisma.user.findFirst({
  where: { email: "john@mail.com", deleted_at: null },
});
```

### Keuntungan ORM:

| Aspek            | SQL Biasa              | Prisma ORM                          |
| ---------------- | ---------------------- | ----------------------------------- |
| Type Safety      | ❌ Tidak ada           | ✅ Ada autocomplete & type checking |
| SQL Injection    | ⚠️ Harus escape manual | ✅ Otomatis aman                    |
| Maintainability  | ❌ Query tersebar      | ✅ Terstruktur                      |
| Migrasi Database | ❌ Manual              | ✅ Otomatis dengan `prisma migrate` |

---

## Prisma vs SQL Biasa

### Perbandingan Syntax

| Operasi    | SQL                                           | Prisma                                                             |
| ---------- | --------------------------------------------- | ------------------------------------------------------------------ |
| Select All | `SELECT * FROM users`                         | `prisma.user.findMany()`                                           |
| Select One | `SELECT * FROM users WHERE id = 'x' LIMIT 1`  | `prisma.user.findFirst({ where: { id: 'x' } })`                    |
| Insert     | `INSERT INTO users (email) VALUES ('x')`      | `prisma.user.create({ data: { email: 'x' } })`                     |
| Update     | `UPDATE users SET email = 'x' WHERE id = 'y'` | `prisma.user.update({ where: { id: 'y' }, data: { email: 'x' } })` |
| Delete     | `DELETE FROM users WHERE id = 'x'`            | `prisma.user.delete({ where: { id: 'x' } })`                       |

---

## Setup & Konfigurasi

### 1. Install Prisma

```bash
npm install prisma @prisma/client
npx prisma init
```

### 2. File yang Dibuat

```
prisma/
├── schema.prisma    # Definisi model/tabel
└── migrations/      # History perubahan database
```

### 3. Konfigurasi Database (schema.prisma)

```prisma
datasource db {
  provider = "postgresql"  // atau "mysql", "sqlite", "mongodb"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

### 4. Commands Penting

```bash
# Generate Prisma Client (setelah ubah schema)
npx prisma generate

# Buat & jalankan migration
npx prisma migrate dev --name nama_migration

# Reset database (HAPUS SEMUA DATA!)
npx prisma migrate reset

# Buka Prisma Studio (GUI untuk lihat data)
npx prisma studio
```

---

## Schema Prisma

Schema adalah definisi struktur tabel database.

### Contoh Schema:

```prisma
model User {
  id         String    @id @default(uuid())    // Primary key, auto UUID
  email      String    @unique                  // Harus unik
  username   String    @unique
  password   String
  created_at DateTime  @default(now())          // Auto isi waktu sekarang
  updated_at DateTime  @updatedAt               // Auto update saat diubah
  deleted_at DateTime?                          // ? = nullable (boleh NULL)

  files MarkdownFile[]                          // Relasi: 1 user punya banyak files

  @@map("users")                                // Nama tabel di database
}
```

### Tipe Data Prisma → SQL

| Prisma                    | PostgreSQL         | MySQL          | Keterangan        |
| ------------------------- | ------------------ | -------------- | ----------------- |
| `String`                  | `TEXT`             | `VARCHAR(191)` | Text biasa        |
| `String @db.VarChar(255)` | `VARCHAR(255)`     | `VARCHAR(255)` | Text dengan limit |
| `String @db.Text`         | `TEXT`             | `LONGTEXT`     | Text panjang      |
| `Int`                     | `INTEGER`          | `INT`          | Bilangan bulat    |
| `Float`                   | `DOUBLE PRECISION` | `DOUBLE`       | Bilangan desimal  |
| `Boolean`                 | `BOOLEAN`          | `TINYINT(1)`   | True/False        |
| `DateTime`                | `TIMESTAMP`        | `DATETIME`     | Tanggal & waktu   |
| `Json`                    | `JSONB`            | `JSON`         | Data JSON         |

### Attributes (Decorators)

| Attribute    | Fungsi                | Contoh                                |
| ------------ | --------------------- | ------------------------------------- |
| `@id`        | Primary key           | `id String @id`                       |
| `@default()` | Nilai default         | `@default(uuid())`, `@default(now())` |
| `@unique`    | Harus unik            | `email String @unique`                |
| `@updatedAt` | Auto update timestamp | `updated_at DateTime @updatedAt`      |
| `?`          | Nullable (boleh NULL) | `deleted_at DateTime?`                |
| `@@map()`    | Nama tabel di DB      | `@@map("users")`                      |
| `@@index()`  | Buat index            | `@@index([user_id])`                  |

---

## CRUD Operations

### CREATE - Buat Data Baru

#### `create()` - Buat 1 Record

```javascript
const user = await prisma.user.create({
  data: {
    email: "john@mail.com",
    username: "johndoe",
    password: "hashed_password",
  },
});
```

**SQL Equivalent:**

```sql
INSERT INTO users (id, email, username, password, created_at, updated_at)
VALUES (uuid_generate_v4(), 'john@mail.com', 'johndoe', 'hashed_password', NOW(), NOW())
RETURNING *;
```

#### `createMany()` - Buat Banyak Record Sekaligus

```javascript
const result = await prisma.user.createMany({
  data: [
    { email: "john@mail.com", username: "john", password: "xxx" },
    { email: "jane@mail.com", username: "jane", password: "xxx" },
    { email: "bob@mail.com", username: "bob", password: "xxx" },
  ],
  skipDuplicates: true, // Skip jika ada yang duplikat
});
// result = { count: 3 }
```

**SQL Equivalent:**

```sql
INSERT INTO users (id, email, username, password, created_at, updated_at)
VALUES
    (uuid(), 'john@mail.com', 'john', 'xxx', NOW(), NOW()),
    (uuid(), 'jane@mail.com', 'jane', 'xxx', NOW(), NOW()),
    (uuid(), 'bob@mail.com', 'bob', 'xxx', NOW(), NOW())
ON CONFLICT DO NOTHING;  -- skipDuplicates
```

---

### READ - Baca Data

#### `findUnique()` - Cari 1 Record by Unique Field

```javascript
// Hanya bisa pakai field yang @unique atau @id
const user = await prisma.user.findUnique({
  where: { id: "user-uuid-123" },
});

const user = await prisma.user.findUnique({
  where: { email: "john@mail.com" }, // email adalah @unique
});
```

**SQL Equivalent:**

```sql
SELECT * FROM users WHERE id = 'user-uuid-123' LIMIT 1;
SELECT * FROM users WHERE email = 'john@mail.com' LIMIT 1;
```

**⚠️ Batasan `findUnique`:**

- HANYA bisa pakai field yang `@unique` atau `@id`
- Tidak bisa kombinasi field biasa

```javascript
// ❌ ERROR! username + email bukan composite unique
await prisma.user.findUnique({
  where: { username: "john", email: "john@mail.com" },
});
```

---

#### `findFirst()` - Cari 1 Record (Lebih Fleksibel)

```javascript
// Bisa pakai field apa saja
const user = await prisma.user.findFirst({
  where: {
    email: "john@mail.com",
    deleted_at: null,
  },
});

// Bisa kombinasi banyak kondisi
const user = await prisma.user.findFirst({
  where: {
    username: "john",
    email: { contains: "@gmail.com" },
    created_at: { gte: new Date("2025-01-01") },
  },
});
```

**SQL Equivalent:**

```sql
SELECT * FROM users
WHERE email = 'john@mail.com' AND deleted_at IS NULL
LIMIT 1;

SELECT * FROM users
WHERE username = 'john'
  AND email LIKE '%@gmail.com%'
  AND created_at >= '2025-01-01'
LIMIT 1;
```

---

#### `findMany()` - Cari Banyak Record

```javascript
// Ambil semua users
const users = await prisma.user.findMany();

// Dengan filter
const users = await prisma.user.findMany({
  where: { deleted_at: null },
  orderBy: { created_at: "desc" },
  take: 10, // LIMIT 10
  skip: 0, // OFFSET 0
});
```

**SQL Equivalent:**

```sql
SELECT * FROM users;

SELECT * FROM users
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;
```

---

### ⭐ Perbedaan `findUnique` vs `findFirst` vs `findMany`

| Method       | Return                | Bisa Filter Apa              | Kapan Pakai                        |
| ------------ | --------------------- | ---------------------------- | ---------------------------------- |
| `findUnique` | `Object \| null`      | Hanya `@unique`/`@id` field  | Cari by ID atau email (pasti unik) |
| `findFirst`  | `Object \| null`      | Semua field, kombinasi bebas | Cari dengan kondisi kompleks       |
| `findMany`   | `Array` (bisa kosong) | Semua field, kombinasi bebas | List data, search, pagination      |

### Contoh Kapan Pakai Apa:

```javascript
// ✅ findUnique - Cari user by ID (pasti unik)
const user = await prisma.user.findUnique({
  where: { id: userId },
});

// ✅ findFirst - Login: cari by email DAN belum dihapus
const user = await prisma.user.findFirst({
  where: {
    email: "john@mail.com",
    deleted_at: null,
  },
});

// ✅ findMany - List semua user aktif
const users = await prisma.user.findMany({
  where: { deleted_at: null },
});

// ✅ findMany - Search user by username (bisa banyak hasil)
const users = await prisma.user.findMany({
  where: {
    username: { contains: "john" }, // LIKE '%john%'
  },
});
```

---

### UPDATE - Ubah Data

#### `update()` - Update 1 Record

```javascript
const user = await prisma.user.update({
  where: { id: "user-uuid-123" },
  data: {
    username: "newusername",
    email: "new@mail.com",
  },
});
```

**SQL Equivalent:**

```sql
UPDATE users
SET username = 'newusername', email = 'new@mail.com', updated_at = NOW()
WHERE id = 'user-uuid-123'
RETURNING *;
```

#### `updateMany()` - Update Banyak Record

```javascript
const result = await prisma.user.updateMany({
  where: { deleted_at: { not: null } }, // Semua yang sudah dihapus
  data: { deleted_at: null }, // Restore semua
});
// result = { count: 5 }
```

**SQL Equivalent:**

```sql
UPDATE users
SET deleted_at = NULL, updated_at = NOW()
WHERE deleted_at IS NOT NULL;
```

#### `upsert()` - Update atau Create

```javascript
// Jika ada, update. Jika tidak ada, create.
const user = await prisma.user.upsert({
  where: { email: "john@mail.com" },
  update: { username: "john_updated" }, // Jika sudah ada
  create: {
    // Jika belum ada
    email: "john@mail.com",
    username: "john_new",
    password: "xxx",
  },
});
```

**SQL Equivalent:**

```sql
INSERT INTO users (email, username, password)
VALUES ('john@mail.com', 'john_new', 'xxx')
ON CONFLICT (email)
DO UPDATE SET username = 'john_updated', updated_at = NOW()
RETURNING *;
```

---

### DELETE - Hapus Data

#### `delete()` - Hapus 1 Record (Hard Delete)

```javascript
const user = await prisma.user.delete({
  where: { id: "user-uuid-123" },
});
```

**SQL Equivalent:**

```sql
DELETE FROM users WHERE id = 'user-uuid-123' RETURNING *;
```

#### `deleteMany()` - Hapus Banyak Record

```javascript
// Hapus semua user yang sudah soft-delete lebih dari 30 hari
const result = await prisma.user.deleteMany({
  where: {
    deleted_at: {
      lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 hari lalu
    },
  },
});
// result = { count: 10 }
```

**SQL Equivalent:**

```sql
DELETE FROM users
WHERE deleted_at < NOW() - INTERVAL '30 days';
```

#### Soft Delete (Recommended)

```javascript
// Jangan hapus beneran, set deleted_at saja
const user = await prisma.user.update({
  where: { id: "user-uuid-123" },
  data: { deleted_at: new Date() },
});
```

**SQL Equivalent:**

```sql
UPDATE users
SET deleted_at = NOW(), updated_at = NOW()
WHERE id = 'user-uuid-123'
RETURNING *;
```

---

## Filtering & Kondisi

### Operators untuk Filter

#### Equals (Sama Dengan)

```javascript
// Implicit (default)
where: {
  email: "john@mail.com";
}

// Explicit
where: {
  email: {
    equals: "john@mail.com";
  }
}
```

**SQL:** `WHERE email = 'john@mail.com'`

#### Not (Tidak Sama Dengan)

```javascript
where: {
  id: {
    not: "user-123";
  }
}
where: {
  deleted_at: {
    not: null;
  }
} // Yang sudah dihapus
```

**SQL:** `WHERE id != 'user-123'`

#### In / NotIn (Ada di List)

```javascript
where: { id: { in: ["user-1", "user-2", "user-3"] } }
where: { status: { notIn: ["banned", "suspended"] } }
```

**SQL:** `WHERE id IN ('user-1', 'user-2', 'user-3')`

#### Contains / StartsWith / EndsWith (String Search)

```javascript
where: { email: { contains: "gmail" } }        // LIKE '%gmail%'
where: { email: { startsWith: "john" } }       // LIKE 'john%'
where: { email: { endsWith: "@gmail.com" } }   // LIKE '%@gmail.com'

// Case insensitive (PostgreSQL)
where: { email: { contains: "JOHN", mode: "insensitive" } }
```

**SQL:**

```sql
WHERE email LIKE '%gmail%'
WHERE email LIKE 'john%'
WHERE email LIKE '%@gmail.com'
WHERE LOWER(email) LIKE LOWER('%JOHN%')
```

#### gt / gte / lt / lte (Perbandingan Angka/Tanggal)

```javascript
// Angka
where: {
  age: {
    gt: 18;
  }
} // > 18
where: {
  age: {
    gte: 18;
  }
} // >= 18
where: {
  age: {
    lt: 65;
  }
} // < 65
where: {
  age: {
    lte: 65;
  }
} // <= 65

// Tanggal
where: {
  created_at: {
    gte: new Date("2025-01-01");
  }
}
where: {
  created_at: {
    lt: new Date("2025-12-31");
  }
}
```

**SQL:**

```sql
WHERE age > 18
WHERE age >= 18
WHERE created_at >= '2025-01-01'
WHERE created_at < '2025-12-31'
```

---

### Kombinasi Kondisi: AND, OR, NOT

#### AND (Default)

```javascript
// Semua kondisi dalam where adalah AND
where: {
    email: "john@mail.com",
    deleted_at: null,
    // username = 'john' AND email = 'john@mail.com' AND deleted_at IS NULL
}

// Explicit AND
where: {
    AND: [
        { email: { contains: "gmail" } },
        { created_at: { gte: new Date("2025-01-01") } }
    ]
}
```

**SQL:** `WHERE email LIKE '%gmail%' AND created_at >= '2025-01-01'`

#### OR

```javascript
where: {
  OR: [{ email: "john@mail.com" }, { username: "johndoe" }];
}
```

**SQL:** `WHERE email = 'john@mail.com' OR username = 'johndoe'`

#### NOT

```javascript
where: {
  NOT: {
    email: {
      contains: "test";
    }
  }
}
```

**SQL:** `WHERE NOT (email LIKE '%test%')`

#### Kombinasi Complex

```javascript
// Cari user aktif yang email-nya gmail ATAU yahoo
where: {
    deleted_at: null,
    OR: [
        { email: { endsWith: "@gmail.com" } },
        { email: { endsWith: "@yahoo.com" } }
    ]
}
```

**SQL:**

```sql
WHERE deleted_at IS NULL
  AND (email LIKE '%@gmail.com' OR email LIKE '%@yahoo.com')
```

---

## Relations (Relasi Antar Tabel)

### Definisi Relasi di Schema

```prisma
model User {
  id    String @id @default(uuid())
  email String @unique

  files MarkdownFile[]  // 1 User punya banyak Files (One-to-Many)

  @@map("users")
}

model MarkdownFile {
  id      String @id @default(uuid())
  title   String
  content String @db.Text
  user_id String

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("markdown_files")
}
```

### Include - Ambil Data Berelasi

```javascript
// Ambil user beserta semua file-nya
const user = await prisma.user.findUnique({
  where: { id: "user-123" },
  include: {
    files: true, // Sertakan semua markdown files
  },
});

// Result:
// {
//   id: "user-123",
//   email: "john@mail.com",
//   files: [
//     { id: "file-1", title: "Note 1", content: "..." },
//     { id: "file-2", title: "Note 2", content: "..." }
//   ]
// }
```

**SQL Equivalent:**

```sql
SELECT * FROM users WHERE id = 'user-123';
SELECT * FROM markdown_files WHERE user_id = 'user-123';
-- Prisma gabungkan hasilnya jadi 1 object
```

### Include dengan Filter

```javascript
const user = await prisma.user.findUnique({
  where: { id: "user-123" },
  include: {
    files: {
      where: { deleted_at: null }, // Filter files
      orderBy: { created_at: "desc" }, // Sort files
      take: 5, // Limit 5 files
    },
  },
});
```

**SQL Equivalent:**

```sql
SELECT * FROM users WHERE id = 'user-123';
SELECT * FROM markdown_files
WHERE user_id = 'user-123' AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 5;
```

### Select - Pilih Field Tertentu

```javascript
// Hanya ambil field tertentu (lebih efisien)
const user = await prisma.user.findUnique({
  where: { id: "user-123" },
  select: {
    id: true,
    email: true,
    username: true,
    // password tidak diambil!
    files: {
      select: {
        id: true,
        title: true,
        // content tidak diambil (hemat bandwidth)
      },
    },
  },
});
```

**SQL Equivalent:**

```sql
SELECT id, email, username FROM users WHERE id = 'user-123';
SELECT id, title FROM markdown_files WHERE user_id = 'user-123';
```

### Create dengan Relasi

```javascript
// Buat user sekaligus file-nya
const user = await prisma.user.create({
  data: {
    email: "john@mail.com",
    username: "john",
    password: "xxx",
    files: {
      create: [
        { title: "Note 1", content: "Content 1" },
        { title: "Note 2", content: "Content 2" },
      ],
    },
  },
  include: { files: true },
});
```

**SQL Equivalent:**

```sql
INSERT INTO users (id, email, username, password)
VALUES (uuid(), 'john@mail.com', 'john', 'xxx');

INSERT INTO markdown_files (id, title, content, user_id)
VALUES
    (uuid(), 'Note 1', 'Content 1', 'user-id'),
    (uuid(), 'Note 2', 'Content 2', 'user-id');
```

---

## Pagination & Sorting

### Basic Pagination

```javascript
const page = 1;
const limit = 10;

const users = await prisma.user.findMany({
  where: { deleted_at: null },
  skip: (page - 1) * limit, // Offset
  take: limit, // Limit
  orderBy: { created_at: "desc" },
});
```

**SQL Equivalent:**

```sql
SELECT * FROM users
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;  -- Page 1
```

### Count Total untuk Pagination

```javascript
const [users, total] = await Promise.all([
  prisma.user.findMany({
    where: { deleted_at: null },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { created_at: "desc" },
  }),
  prisma.user.count({
    where: { deleted_at: null },
  }),
]);

const totalPages = Math.ceil(total / limit);

// Return
// {
//   data: users,
//   pagination: {
//     page: 1,
//     limit: 10,
//     total: 100,
//     totalPages: 10
//   }
// }
```

### Multiple Sorting

```javascript
const users = await prisma.user.findMany({
  orderBy: [
    { created_at: "desc" }, // Primary sort
    { username: "asc" }, // Secondary sort
  ],
});
```

**SQL:** `ORDER BY created_at DESC, username ASC`

---

## Transactions

### Untuk operasi yang harus semua berhasil atau semua gagal

```javascript
// Contoh: Transfer file ownership
const result = await prisma.$transaction(async (tx) => {
  // 1. Update file owner
  const file = await tx.markdownFile.update({
    where: { id: "file-123" },
    data: { user_id: "new-owner-id" },
  });

  // 2. Log transfer
  const log = await tx.transferLog.create({
    data: {
      file_id: file.id,
      from_user: "old-owner-id",
      to_user: "new-owner-id",
    },
  });

  return { file, log };
});
// Jika salah satu gagal, semua di-rollback
```

**SQL Equivalent:**

```sql
BEGIN;
UPDATE markdown_files SET user_id = 'new-owner-id' WHERE id = 'file-123';
INSERT INTO transfer_logs (...) VALUES (...);
COMMIT;
-- Jika error: ROLLBACK;
```

---

## Tips & Best Practices

### 1. Selalu Handle NULL

```javascript
// ❌ Bisa error jika user tidak ditemukan
const user = await prisma.user.findFirst({ where: { id } });
console.log(user.email); // Error jika user = null

// ✅ Handle null
const user = await prisma.user.findFirst({ where: { id } });
if (!user) {
  throw new Error("User tidak ditemukan");
}
console.log(user.email);
```

### 2. Gunakan Select untuk Optimasi

```javascript
// ❌ Ambil semua field (boros)
const user = await prisma.user.findFirst({ where: { id } });

// ✅ Ambil yang diperlukan saja
const user = await prisma.user.findFirst({
  where: { id },
  select: { id: true, email: true, username: true },
});
```

### 3. Jangan Expose Password

```javascript
// Di repository/service, selalu exclude password
export const findById = async (id) => {
  return prisma.user.findFirst({
    where: { id, deleted_at: null },
    select: {
      id: true,
      email: true,
      username: true,
      created_at: true,
      // password: false (tidak diambil)
    },
  });
};

// Khusus untuk login, baru ambil password
export const findByEmailWithPassword = async (email) => {
  return prisma.user.findFirst({
    where: { email, deleted_at: null },
    // Ambil semua termasuk password
  });
};
```

### 4. Soft Delete Pattern

```javascript
// Constant untuk filter soft delete
const notDeleted = { deleted_at: null };

// Pakai di semua query
export const findById = async (id) => {
  return prisma.user.findFirst({
    where: { id, ...notDeleted },
  });
};
```

### 5. Error Handling

```javascript
import { Prisma } from "@prisma/client";

try {
    await prisma.user.create({
        data: { email: "duplicate@mail.com", ... }
    });
} catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
            // Unique constraint violation
            throw new Error("Email sudah dipakai");
        }
    }
    throw error;
}
```

### Error Codes Prisma yang Sering Muncul

| Code  | Arti                          | Solusi                       |
| ----- | ----------------------------- | ---------------------------- |
| P2002 | Unique constraint failed      | Data duplikat, validasi dulu |
| P2025 | Record not found              | Data tidak ada, handle null  |
| P2003 | Foreign key constraint failed | Parent record tidak ada      |
| P2014 | Required relation violation   | Relasi wajib tidak terpenuhi |

---

## Cheatsheet

```javascript
// CREATE
prisma.user.create({ data: {...} })
prisma.user.createMany({ data: [...] })

// READ
prisma.user.findUnique({ where: { id } })      // By unique field only
prisma.user.findFirst({ where: {...} })         // Any field, 1 result
prisma.user.findMany({ where: {...} })          // Any field, many results
prisma.user.count({ where: {...} })             // Count records

// UPDATE
prisma.user.update({ where: { id }, data: {...} })
prisma.user.updateMany({ where: {...}, data: {...} })
prisma.user.upsert({ where, update, create })

// DELETE
prisma.user.delete({ where: { id } })
prisma.user.deleteMany({ where: {...} })

// OPTIONS
{
    where: {...},           // Filter
    select: {...},          // Pilih field
    include: {...},         // Sertakan relasi
    orderBy: {...},         // Sorting
    take: 10,               // Limit
    skip: 0,                // Offset
}

// FILTERS
{ field: value }                    // Equals
{ field: { not: value } }           // Not equals
{ field: { in: [...] } }            // In array
{ field: { contains: "x" } }        // LIKE %x%
{ field: { startsWith: "x" } }      // LIKE x%
{ field: { endsWith: "x" } }        // LIKE %x
{ field: { gt: 10 } }               // > 10
{ field: { gte: 10 } }              // >= 10
{ field: { lt: 10 } }               // < 10
{ field: { lte: 10 } }              // <= 10
{ AND: [...] }                      // AND
{ OR: [...] }                       // OR
{ NOT: {...} }                      // NOT
```

---

## Referensi

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Client API Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
