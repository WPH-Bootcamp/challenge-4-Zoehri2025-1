/**
 * Class StudentManager
 * Mengelola koleksi siswa dan operasi-operasi terkait
 *
 * TODO: Implementasikan class StudentManager dengan:
 * - Constructor untuk inisialisasi array students
 * - Method addStudent(student) untuk menambah siswa
 * - Method removeStudent(id) untuk menghapus siswa
 * - Method findStudent(id) untuk mencari siswa
 * - Method updateStudent(id, data) untuk update data siswa
 * - Method getAllStudents() untuk mendapatkan semua siswa
 * - Method getTopStudents(n) untuk mendapatkan top n siswa
 * - Method displayAllStudents() untuk menampilkan semua siswa
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import Student from './Student.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.resolve(DATA_DIR, 'students.json');

class StudentManager {
  #students;

  constructor() {
    this.#students = [];
    this.#ensureDataDirectory();
    this.#loadFromFile();
  }

  /**
   * Menambah siswa baru ke dalam sistem
   * @param {Student} student - Object Student yang akan ditambahkan
   * @returns {boolean} true jika berhasil, false jika ID sudah ada
   */
  addStudent(student) {
    if (!(student instanceof Student)) {
      throw new Error('Parameter student harus instance dari Student.');
    }

    if (this.findStudent(student.id)) {
      return false;
    }

    this.#students.push(student);
    this.#saveToFile();
    return true;
  }

  /**
   * Menghapus siswa berdasarkan ID
   * @param {string} id - ID siswa yang akan dihapus
   * @returns {boolean} true jika berhasil, false jika tidak ditemukan
   */
  removeStudent(id) {
    const index = this.#students.findIndex((student) => student.id === id);
    if (index === -1) {
      return false;
    }
    this.#students.splice(index, 1);
    this.#saveToFile();
    return true;
  }

  /**
   * Mencari siswa berdasarkan ID
   * @param {string} id - ID siswa yang dicari
   * @returns {Student|null} Object Student jika ditemukan, null jika tidak
   */
  findStudent(id) {
    return this.#students.find((student) => student.id === id) ?? null;
  }

  /**
   * Update data siswa
   * @param {string} id - ID siswa yang akan diupdate
   * @param {object} data - Data baru (name, class)
   * @returns {boolean} true jika berhasil, false jika tidak ditemukan
   */
  updateStudent(id, data) {
    const student = this.findStudent(id);
    if (!student) {
      return false;
    }

    if (data?.name !== undefined) {
      student.name = data.name;
    }
    if (data?.class !== undefined) {
      student.class = data.class;
    }

    this.#saveToFile();
    return true;
  }

  /**
   * Mendapatkan semua siswa
   * @returns {Array<Student>} Array berisi semua siswa
   */
  getAllStudents() {
    return [...this.#students];
  }

  /**
   * Mendapatkan top n siswa berdasarkan rata-rata nilai
   * @param {number} n - Jumlah siswa yang ingin didapatkan
   * @returns {Array<Student>} Array berisi top n siswa
   */
  getTopStudents(n) {
    return [...this.#students]
      .sort((a, b) => b.getAverage() - a.getAverage())
      .slice(0, n);
  }

  /**
   * Menampilkan informasi semua siswa
   */
  displayAllStudents() {
    if (this.#students.length === 0) {
      console.log(chalk.yellow('Belum ada data siswa.'));
      return;
    }

    console.log(chalk.bold.cyan('=== DAFTAR SISWA ==='));
    this.#students.forEach((student) => {
      student.displayInfo();
    });
  }

  /**
   * BONUS: Mendapatkan siswa berdasarkan kelas
   * @param {string} className - Nama kelas
   * @returns {Array<Student>} Array siswa dalam kelas tersebut
   */
  getStudentsByClass(className) {
    const normalizedClass = String(className ?? '').trim();
    if (!normalizedClass) {
      return [];
    }
    return this.#students.filter(
      (student) => student.class.toLowerCase() === normalizedClass.toLowerCase()
    );
  }

  /**
   * BONUS: Mendapatkan statistik kelas
   * @param {string} className - Nama kelas
   * @returns {object|null} Object berisi statistik (jumlah siswa, rata-rata kelas, dll)
   */
  getClassStatistics(className) {
    const classStudents = this.getStudentsByClass(className);
    if (classStudents.length === 0) {
      return null;
    }
    const averages = classStudents.map((student) => student.getAverage());
    const totalAverage = averages.reduce((sum, avg) => sum + avg, 0);
    const highest = Math.max(...averages);
    const lowest = Math.min(...averages);
    return {
      class: classStudents[0].class,
      studentCount: classStudents.length,
      averageScore: Number((totalAverage / classStudents.length).toFixed(2)),
      highestAverage: highest,
      lowestAverage: lowest,
    };
  }

  /**
   * Membuat direktori data jika belum ada
   * @private
   */
  #ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  /**
   * Memuat data siswa dari file JSON
   * @private
   */
  #loadFromFile() {
    if (!fs.existsSync(DATA_FILE)) {
      this.#saveToFile();
      return;
    }
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      if (!raw) {
        return;
      }
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) {
        return;
      }
      this.#students = data.map(
        (item) => new Student(item.id, item.name, item.class, item.grades)
      );
    } catch (error) {
      console.error('Gagal memuat data siswa:', error.message);
      this.#students = [];
    }
  }

  /**
   * Menyimpan data siswa ke file JSON
   * @private
   */
  #saveToFile() {
    try {
      const payload = JSON.stringify(
        this.#students.map((student) => student.toJSON()),
        null,
        2
      );
      fs.writeFileSync(DATA_FILE, payload, 'utf-8');
    } catch (error) {
      console.error('Gagal menyimpan data siswa:', error.message);
    }
  }
}

export default StudentManager;
