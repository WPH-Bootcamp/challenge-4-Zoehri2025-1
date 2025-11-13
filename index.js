/**
 * Main Application - CLI Interface
 * File ini adalah entry point aplikasi
 *
 * TODO: Implementasikan CLI interface yang interaktif dengan menu:
 * 1. Tambah Siswa Baru
 * 2. Lihat Semua Siswa
 * 3. Cari Siswa (by ID)
 * 4. Update Data Siswa
 * 5. Hapus Siswa
 * 6. Tambah Nilai Siswa
 * 7. Lihat Top 3 Siswa
 * 8. Keluar
 */

import readlineSync from 'readline-sync';
import Student from './src/Student.js';
import StudentManager from './src/StudentManager.js';

// Inisialisasi StudentManager
const manager = new StudentManager();

/**
 * Menampilkan menu utama
 */
function displayMenu() {
  console.log('\n=================================');
  console.log('SISTEM MANAJEMEN NILAI SISWA');
  console.log('=================================');
  console.log('1. Tambah Siswa Baru');
  console.log('2. Lihat Semua Siswa');
  console.log('3. Cari Siswa');
  console.log('4. Update Data Siswa');
  console.log('5. Hapus Siswa');
  console.log('6. Tambah Nilai Siswa');
  console.log('7. Lihat Top 3 Siswa');
  console.log('8. Keluar');
  console.log('=================================');
}

/**
 * Handler untuk menambah siswa baru
 * TODO: Implementasikan function ini
 * - Minta input: ID, Nama, Kelas
 * - Buat object Student baru
 * - Tambahkan ke manager
 * - Tampilkan pesan sukses/gagal
 */
function askNonEmptyInput(promptText, validator) {
  let value = '';
  do {
    value = readlineSync.question(promptText).trim();
    if (!value) {
      console.log('Input tidak boleh kosong. Silakan coba lagi.');
      continue;
    }
    if (validator && !validator(value)) {
      value = '';
    }
  } while (!value);
  return value;
}

function askYesNo(promptText) {
  const answer = readlineSync.question(`${promptText} (y/n): `, {
    limit: /^(y|n)$/i,
    limitMessage: 'Masukkan y atau n.',
  });
  return answer.toLowerCase() === 'y';
}

function askScore(promptText) {
  while (true) {
    const input = readlineSync.question(promptText).trim();
    const score = Number(input);
    if (Number.isFinite(score) && score >= 0 && score <= 100) {
      return score;
    }
    console.log('Nilai harus berupa angka antara 0 dan 100.');
  }
}

function addNewStudent() {
  console.log('\n--- Tambah Siswa Baru ---');
  const id = askNonEmptyInput('Masukkan ID siswa: ', (value) => {
    if (manager.findStudent(value)) {
      console.log('ID sudah digunakan. Silakan gunakan ID lain.');
      return false;
    }
    return true;
  });
  const name = askNonEmptyInput('Masukkan nama siswa: ');
  const studentClass = askNonEmptyInput('Masukkan kelas siswa (misal: 10A): ');

  try {
    const student = new Student(id, name, studentClass);
    if (manager.addStudent(student)) {
      console.log('Siswa berhasil ditambahkan.');
      if (askYesNo('Apakah ingin langsung menambahkan nilai?')) {
        addGradesToStudent(student);
      }
    } else {
      console.log('Gagal menambahkan siswa. ID mungkin sudah digunakan.');
    }
  } catch (error) {
    console.log(`Gagal membuat siswa: ${error.message}`);
  }
}

/**
 * Handler untuk melihat semua siswa
 * TODO: Implementasikan function ini
 * - Panggil method displayAllStudents dari manager
 * - Jika tidak ada siswa, tampilkan pesan
 */
function viewAllStudents() {
  console.log('\n--- Daftar Semua Siswa ---');
  manager.displayAllStudents();
}

/**
 * Handler untuk mencari siswa berdasarkan ID
 * TODO: Implementasikan function ini
 * - Minta input ID
 * - Cari siswa menggunakan manager
 * - Tampilkan info siswa jika ditemukan
 */
function searchStudent() {
  console.log('\n--- Cari Siswa ---');
  const id = readlineSync.question('Masukkan ID siswa: ').trim();
  if (!id) {
    console.log('ID tidak boleh kosong.');
    return;
  }
  const student = manager.findStudent(id);
  if (!student) {
    console.log(`Siswa dengan ID ${id} tidak ditemukan.`);
    return;
  }
  student.displayInfo();
}

/**
 * Handler untuk update data siswa
 * TODO: Implementasikan function ini
 * - Minta input ID siswa
 * - Tampilkan data saat ini
 * - Minta input data baru (nama, kelas)
 * - Update menggunakan manager
 */
function updateStudent() {
  console.log('\n--- Update Data Siswa ---');
  const id = readlineSync
    .question('Masukkan ID siswa yang akan diupdate: ')
    .trim();
  if (!id) {
    console.log('ID tidak boleh kosong.');
    return;
  }
  const student = manager.findStudent(id);
  if (!student) {
    console.log(`Siswa dengan ID ${id} tidak ditemukan.`);
    return;
  }

  console.log('\nData saat ini:');
  student.displayInfo();

  const newName = readlineSync
    .question('Masukkan nama baru (kosongkan jika tidak ingin mengubah): ')
    .trim();
  const newClass = readlineSync
    .question('Masukkan kelas baru (kosongkan jika tidak ingin mengubah): ')
    .trim();

  if (!newName && !newClass) {
    console.log('Tidak ada perubahan yang dilakukan.');
    return;
  }

  try {
    const success = manager.updateStudent(id, {
      name: newName || undefined,
      class: newClass || undefined,
    });
    console.log(
      success
        ? 'Data siswa berhasil diperbarui.'
        : 'Gagal memperbarui data siswa.'
    );
  } catch (error) {
    console.log(`Gagal memperbarui data siswa: ${error.message}`);
  }
}

/**
 * Handler untuk menghapus siswa
 * TODO: Implementasikan function ini
 * - Minta input ID siswa
 * - Konfirmasi penghapusan
 * - Hapus menggunakan manager
 */
function deleteStudent() {
  console.log('\n--- Hapus Siswa ---');
  const id = readlineSync
    .question('Masukkan ID siswa yang akan dihapus: ')
    .trim();
  if (!id) {
    console.log('ID tidak boleh kosong.');
    return;
  }
  const student = manager.findStudent(id);
  if (!student) {
    console.log(`Siswa dengan ID ${id} tidak ditemukan.`);
    return;
  }
  student.displayInfo();

  if (!askYesNo('Apakah Anda yakin ingin menghapus siswa ini?')) {
    console.log('Penghapusan dibatalkan.');
    return;
  }

  const success = manager.removeStudent(id);
  console.log(success ? 'Siswa berhasil dihapus.' : 'Gagal menghapus siswa.');
}

/**
 * Handler untuk menambah nilai siswa
 * TODO: Implementasikan function ini
 * - Minta input ID siswa
 * - Tampilkan data siswa
 * - Minta input mata pelajaran dan nilai
 * - Tambahkan nilai menggunakan method addGrade
 */
function addGradesToStudent(student) {
  let adding = true;
  while (adding) {
    const subject = askNonEmptyInput('Masukkan nama mata pelajaran: ');
    const score = askScore('Masukkan nilai (0-100): ');
    try {
      student.addGrade(subject, score);
      manager.updateStudent(student.id, {
        name: student.name,
        class: student.class,
      });
      console.log('Nilai berhasil ditambahkan/diperbarui.');
    } catch (error) {
      console.log(`Gagal menambahkan nilai: ${error.message}`);
    }
    adding = askYesNo('Apakah ingin menambahkan nilai lain?');
  }
}

function addGradeToStudent() {
  console.log('\n--- Tambah Nilai Siswa ---');
  const id = readlineSync.question('Masukkan ID siswa: ').trim();
  if (!id) {
    console.log('ID tidak boleh kosong.');
    return;
  }
  const student = manager.findStudent(id);
  if (!student) {
    console.log(`Siswa dengan ID ${id} tidak ditemukan.`);
    return;
  }
  student.displayInfo();
  addGradesToStudent(student);
}

/**
 * Handler untuk melihat top students
 * TODO: Implementasikan function ini
 * - Panggil getTopStudents(3) dari manager
 * - Tampilkan informasi siswa
 */
function viewTopStudents() {
  console.log('\n--- Top 3 Siswa ---');
  const topStudents = manager.getTopStudents(3);
  if (topStudents.length === 0) {
    console.log('Belum ada data siswa.');
    return;
  }
  topStudents.forEach((student, index) => {
    console.log(`Peringkat ${index + 1}`);
    student.displayInfo();
  });
}

/**
 * Main program loop
 * TODO: Implementasikan main loop
 * - Tampilkan menu
 * - Baca input pilihan
 * - Panggil handler yang sesuai
 * - Ulangi sampai user pilih keluar
 */
function main() {
  console.log('Selamat datang di Sistem Manajemen Nilai Siswa!');

  // TODO: Implementasikan loop utama program
  let running = true;

  while (running) {
    displayMenu();
    const choice = readlineSync.question('Pilih menu (1-8): ').trim();

    switch (choice) {
      case '1':
        addNewStudent();
        break;
      case '2':
        viewAllStudents();
        break;
      case '3':
        searchStudent();
        break;
      case '4':
        updateStudent();
        break;
      case '5':
        deleteStudent();
        break;
      case '6':
        addGradeToStudent();
        break;
      case '7':
        viewTopStudents();
        break;
      case '8':
        running = false;
        break;
      default:
        console.log('Pilihan tidak valid. Silakan pilih menu 1-8.');
    }
  }

  console.log('\nTerima kasih telah menggunakan aplikasi ini!');
}

// Jalankan aplikasi
main();
