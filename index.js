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
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Student from './src/Student.js';
import StudentManager from './src/StudentManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inisialisasi StudentManager
const manager = new StudentManager();

/**
 * Menampilkan menu utama
 */
function displayMenu() {
  console.log('\n' + chalk.cyan('================================='));
  console.log(chalk.bold.cyan('SISTEM MANAJEMEN NILAI SISWA'));
  console.log(chalk.cyan('================================='));
  console.log(chalk.white('1. Tambah Siswa Baru'));
  console.log(chalk.white('2. Lihat Semua Siswa'));
  console.log(chalk.white('3. Cari Siswa'));
  console.log(chalk.white('4. Update Data Siswa'));
  console.log(chalk.white('5. Hapus Siswa'));
  console.log(chalk.white('6. Tambah Nilai Siswa'));
  console.log(chalk.white('7. Lihat Top 3 Siswa'));
  console.log(chalk.yellow('8. Filter Siswa by Kelas'));
  console.log(chalk.yellow('9. Statistik Kelas'));
  console.log(chalk.yellow('10. Export Laporan ke File'));
  console.log(chalk.red('11. Keluar'));
  console.log(chalk.cyan('================================='));
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
    value = readlineSync.question(chalk.blue(promptText)).trim();
    if (!value) {
      console.log(chalk.red('Input tidak boleh kosong. Silakan coba lagi.'));
      continue;
    }
    if (validator && !validator(value)) {
      value = '';
    }
  } while (!value);
  return value;
}

function askYesNo(promptText) {
  const answer = readlineSync.question(chalk.blue(`${promptText} (y/n): `), {
    limit: /^(y|n)$/i,
    limitMessage: chalk.red('Masukkan y atau n.'),
  });
  return answer.toLowerCase() === 'y';
}

function askScore(promptText) {
  while (true) {
    const input = readlineSync.question(chalk.blue(promptText)).trim();
    const score = Number(input);
    if (Number.isFinite(score) && score >= 0 && score <= 100) {
      return score;
    }
    console.log(chalk.red('Nilai harus berupa angka antara 0 dan 100.'));
  }
}

function addNewStudent() {
  console.log('\n' + chalk.bold.cyan('--- Tambah Siswa Baru ---'));
  const id = askNonEmptyInput('Masukkan ID siswa: ', (value) => {
    if (manager.findStudent(value)) {
      console.log(chalk.red('ID sudah digunakan. Silakan gunakan ID lain.'));
      return false;
    }
    return true;
  });
  const name = askNonEmptyInput('Masukkan nama siswa: ');
  const studentClass = askNonEmptyInput('Masukkan kelas siswa (misal: 10A): ');

  try {
    const student = new Student(id, name, studentClass);
    if (manager.addStudent(student)) {
      console.log(chalk.green('✓ Siswa berhasil ditambahkan.'));
      if (askYesNo('Apakah ingin langsung menambahkan nilai?')) {
        addGradesToStudent(student);
      }
    } else {
      console.log(
        chalk.red('✗ Gagal menambahkan siswa. ID mungkin sudah digunakan.')
      );
    }
  } catch (error) {
    console.log(chalk.red(`✗ Gagal membuat siswa: ${error.message}`));
  }
}

/**
 * Handler untuk melihat semua siswa
 * TODO: Implementasikan function ini
 * - Panggil method displayAllStudents dari manager
 * - Jika tidak ada siswa, tampilkan pesan
 */
function viewAllStudents() {
  console.log('\n' + chalk.bold.cyan('--- Daftar Semua Siswa ---'));
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
  console.log('\n' + chalk.bold.cyan('--- Cari Siswa ---'));
  const id = readlineSync.question(chalk.blue('Masukkan ID siswa: ')).trim();
  if (!id) {
    console.log(chalk.red('ID tidak boleh kosong.'));
    return;
  }
  const student = manager.findStudent(id);
  if (!student) {
    console.log(chalk.red(`✗ Siswa dengan ID ${id} tidak ditemukan.`));
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
  console.log('\n' + chalk.bold.cyan('--- Update Data Siswa ---'));
  const id = readlineSync
    .question(chalk.blue('Masukkan ID siswa yang akan diupdate: '))
    .trim();
  if (!id) {
    console.log(chalk.red('ID tidak boleh kosong.'));
    return;
  }
  const student = manager.findStudent(id);
  if (!student) {
    console.log(chalk.red(`✗ Siswa dengan ID ${id} tidak ditemukan.`));
    return;
  }

  console.log(chalk.yellow('\nData saat ini:'));
  student.displayInfo();

  const newName = readlineSync
    .question(
      chalk.blue('Masukkan nama baru (kosongkan jika tidak ingin mengubah): ')
    )
    .trim();
  const newClass = readlineSync
    .question(
      chalk.blue('Masukkan kelas baru (kosongkan jika tidak ingin mengubah): ')
    )
    .trim();

  if (!newName && !newClass) {
    console.log(chalk.yellow('Tidak ada perubahan yang dilakukan.'));
    return;
  }

  try {
    const success = manager.updateStudent(id, {
      name: newName || undefined,
      class: newClass || undefined,
    });
    console.log(
      success
        ? chalk.green('✓ Data siswa berhasil diperbarui.')
        : chalk.red('✗ Gagal memperbarui data siswa.')
    );
  } catch (error) {
    console.log(chalk.red(`✗ Gagal memperbarui data siswa: ${error.message}`));
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
  console.log('\n' + chalk.bold.red('--- Hapus Siswa ---'));
  const id = readlineSync
    .question(chalk.blue('Masukkan ID siswa yang akan dihapus: '))
    .trim();
  if (!id) {
    console.log(chalk.red('ID tidak boleh kosong.'));
    return;
  }
  const student = manager.findStudent(id);
  if (!student) {
    console.log(chalk.red(`✗ Siswa dengan ID ${id} tidak ditemukan.`));
    return;
  }
  student.displayInfo();

  if (!askYesNo('Apakah Anda yakin ingin menghapus siswa ini?')) {
    console.log(chalk.yellow('Penghapusan dibatalkan.'));
    return;
  }

  const success = manager.removeStudent(id);
  console.log(
    success
      ? chalk.green('✓ Siswa berhasil dihapus.')
      : chalk.red('✗ Gagal menghapus siswa.')
  );
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
      console.log(chalk.green('✓ Nilai berhasil ditambahkan/diperbarui.'));
    } catch (error) {
      console.log(chalk.red(`✗ Gagal menambahkan nilai: ${error.message}`));
    }
    adding = askYesNo('Apakah ingin menambahkan nilai lain?');
  }
}

function addGradeToStudent() {
  console.log('\n' + chalk.bold.cyan('--- Tambah Nilai Siswa ---'));
  const id = readlineSync.question(chalk.blue('Masukkan ID siswa: ')).trim();
  if (!id) {
    console.log(chalk.red('ID tidak boleh kosong.'));
    return;
  }
  const student = manager.findStudent(id);
  if (!student) {
    console.log(chalk.red(`✗ Siswa dengan ID ${id} tidak ditemukan.`));
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
  console.log('\n' + chalk.bold.cyan('--- Top 3 Siswa ---'));
  const topStudents = manager.getTopStudents(3);
  if (topStudents.length === 0) {
    console.log(chalk.yellow('Belum ada data siswa.'));
    return;
  }
  topStudents.forEach((student, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
    console.log(chalk.bold.yellow(`\n${medal} Peringkat ${index + 1}`));
    student.displayInfo();
  });
}

/**
 * Handler untuk filter siswa berdasarkan kelas
 */
function filterStudentsByClass() {
  console.log('\n' + chalk.bold.cyan('--- Filter Siswa by Kelas ---'));
  const className = readlineSync
    .question(chalk.blue('Masukkan nama kelas (misal: 10A): '))
    .trim();
  if (!className) {
    console.log(chalk.red('Nama kelas tidak boleh kosong.'));
    return;
  }

  const students = manager.getStudentsByClass(className);
  if (students.length === 0) {
    console.log(chalk.yellow(`Tidak ada siswa di kelas ${className}.`));
    return;
  }

  console.log(
    chalk.bold.green(
      `\n=== Daftar Siswa Kelas ${className} (${students.length} siswa) ===`
    )
  );
  students.forEach((student) => {
    student.displayInfo();
  });
}

/**
 * Handler untuk melihat statistik kelas
 */
function viewClassStatistics() {
  console.log('\n' + chalk.bold.cyan('--- Statistik Kelas ---'));
  const className = readlineSync
    .question(chalk.blue('Masukkan nama kelas (misal: 10A): '))
    .trim();
  if (!className) {
    console.log(chalk.red('Nama kelas tidak boleh kosong.'));
    return;
  }

  const stats = manager.getClassStatistics(className);
  if (!stats) {
    console.log(chalk.yellow(`Tidak ada data untuk kelas ${className}.`));
    return;
  }

  console.log(chalk.bold.green(`\n=== Statistik Kelas ${stats.class} ===`));
  console.log(chalk.white(`Jumlah Siswa: ${chalk.bold(stats.studentCount)}`));
  console.log(
    chalk.white(
      `Rata-rata Kelas: ${chalk.bold.yellow(stats.averageScore.toFixed(2))}`
    )
  );
  console.log(
    chalk.white(
      `Rata-rata Tertinggi: ${chalk.bold.green(
        stats.highestAverage.toFixed(2)
      )}`
    )
  );
  console.log(
    chalk.white(
      `Rata-rata Terendah: ${chalk.bold.red(stats.lowestAverage.toFixed(2))}`
    )
  );
  console.log(chalk.cyan('------------------------'));
}

/**
 * Handler untuk export laporan ke file
 */
function exportReport() {
  console.log('\n' + chalk.bold.cyan('--- Export Laporan ke File ---'));

  const allStudents = manager.getAllStudents();
  if (allStudents.length === 0) {
    console.log(chalk.yellow('Belum ada data siswa untuk diekspor.'));
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const defaultFileName = `laporan-siswa-${timestamp}.txt`;
  const fileName =
    readlineSync
      .question(
        chalk.blue(`Masukkan nama file (Enter untuk ${defaultFileName}): `)
      )
      .trim() || defaultFileName;

  const reportsDir = path.resolve(__dirname, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const filePath = path.resolve(reportsDir, fileName);

  try {
    let report = '='.repeat(50) + '\n';
    report += 'LAPORAN DATA SISWA\n';
    report += `Tanggal: ${new Date().toLocaleString('id-ID')}\n`;
    report += `Total Siswa: ${allStudents.length}\n`;
    report += '='.repeat(50) + '\n\n';

    // Statistik umum
    const averages = allStudents
      .map((s) => s.getAverage())
      .filter((avg) => avg > 0);
    const totalAverage =
      averages.length > 0
        ? (
            averages.reduce((sum, avg) => sum + avg, 0) / averages.length
          ).toFixed(2)
        : 0;
    const passed = allStudents.filter((s) => s.getAverage() >= 75).length;
    const failed = allStudents.length - passed;

    report += 'STATISTIK UMUM\n';
    report += '-'.repeat(50) + '\n';
    report += `Rata-rata Keseluruhan: ${totalAverage}\n`;
    report += `Jumlah Lulus: ${passed}\n`;
    report += `Jumlah Tidak Lulus: ${failed}\n`;
    report += '\n';

    // Data per kelas
    const classGroups = {};
    allStudents.forEach((student) => {
      if (!classGroups[student.class]) {
        classGroups[student.class] = [];
      }
      classGroups[student.class].push(student);
    });

    Object.keys(classGroups)
      .sort()
      .forEach((className) => {
        const classStats = manager.getClassStatistics(className);
        if (classStats) {
          report += `\nKELAS ${className}\n`;
          report += '-'.repeat(50) + '\n';
          report += `Jumlah Siswa: ${classStats.studentCount}\n`;
          report += `Rata-rata Kelas: ${classStats.averageScore}\n`;
          report += `Rata-rata Tertinggi: ${classStats.highestAverage.toFixed(
            2
          )}\n`;
          report += `Rata-rata Terendah: ${classStats.lowestAverage.toFixed(
            2
          )}\n`;
          report += '\n';
        }
      });

    // Detail semua siswa
    report += '\n' + '='.repeat(50) + '\n';
    report += 'DETAIL SISWA\n';
    report += '='.repeat(50) + '\n\n';

    allStudents.forEach((student, index) => {
      report += `[${index + 1}] ID: ${student.id}\n`;
      report += `    Nama: ${student.name}\n`;
      report += `    Kelas: ${student.class}\n`;
      report += `    Mata Pelajaran:\n`;

      const grades = student.grades;
      if (Object.keys(grades).length === 0) {
        report += `      (Belum ada nilai)\n`;
      } else {
        Object.entries(grades).forEach(([subject, score]) => {
          report += `      - ${subject}: ${score}\n`;
        });
      }

      report += `    Rata-rata: ${student.getAverage()}\n`;
      report += `    Status: ${student.getGradeStatus()}\n`;
      report += '-'.repeat(50) + '\n';
    });

    fs.writeFileSync(filePath, report, 'utf-8');
    console.log(chalk.green(`✓ Laporan berhasil diekspor ke: ${filePath}`));
  } catch (error) {
    console.log(chalk.red(`✗ Gagal mengekspor laporan: ${error.message}`));
  }
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
  console.log(chalk.bold.cyan('\n╔════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║  SISTEM MANAJEMEN NILAI SISWA         ║'));
  console.log(chalk.bold.cyan('╚════════════════════════════════════════╝'));
  console.log(chalk.green('Selamat datang di Sistem Manajemen Nilai Siswa!'));

  let running = true;

  while (running) {
    displayMenu();
    const choice = readlineSync
      .question(chalk.blue('Pilih menu (1-11): '))
      .trim();

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
        filterStudentsByClass();
        break;
      case '9':
        viewClassStatistics();
        break;
      case '10':
        exportReport();
        break;
      case '11':
        running = false;
        break;
      default:
        console.log(
          chalk.red('✗ Pilihan tidak valid. Silakan pilih menu 1-11.')
        );
    }
  }

  console.log(chalk.green('\nTerima kasih telah menggunakan aplikasi ini!'));
}

// Jalankan aplikasi
main();
