/**
 * Class Student
 * Representasi dari seorang siswa dengan data dan nilai-nilainya
 *
 * TODO: Implementasikan class Student dengan:
 * - Constructor untuk inisialisasi properti (id, name, class, grades)
 * - Method addGrade(subject, score) untuk menambah nilai mata pelajaran
 * - Method getAverage() untuk menghitung rata-rata nilai
 * - Method getGradeStatus() untuk menentukan status Lulus/Tidak Lulus
 * - Method displayInfo() untuk menampilkan informasi siswa
 *
 * Kriteria Lulus: rata-rata >= 75
 */

class Student {
  #id;
  #name;
  #class;
  #grades;

  /**
   * @param {string|number} id
   * @param {string} name
   * @param {string} studentClass
   * @param {object} grades
   */
  constructor(id, name, studentClass, grades = {}) {
    const normalizedId =
      typeof id === 'number' ? String(id) : String(id ?? '').trim();
    if (!normalizedId) {
      throw new Error('ID siswa tidak boleh kosong.');
    }
    const normalizedName = String(name ?? '').trim();
    if (!normalizedName) {
      throw new Error('Nama siswa tidak boleh kosong.');
    }
    const normalizedClass = String(studentClass ?? '').trim();
    if (!normalizedClass) {
      throw new Error('Kelas siswa tidak boleh kosong.');
    }

    if (
      typeof grades !== 'object' ||
      grades === null ||
      Array.isArray(grades)
    ) {
      throw new Error('Grades harus berupa object.');
    }

    this.#id = normalizedId;
    this.#name = normalizedName;
    this.#class = normalizedClass;
    this.#grades = {};

    Object.entries(grades).forEach(([subject, score]) => {
      this.addGrade(subject, score);
    });
  }

  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }

  set name(value) {
    const normalizedName = String(value ?? '').trim();
    if (!normalizedName) {
      throw new Error('Nama siswa tidak boleh kosong.');
    }
    this.#name = normalizedName;
  }

  get class() {
    return this.#class;
  }

  set class(value) {
    const normalizedClass = String(value ?? '').trim();
    if (!normalizedClass) {
      throw new Error('Kelas siswa tidak boleh kosong.');
    }
    this.#class = normalizedClass;
  }

  get grades() {
    return { ...this.#grades };
  }

  /**
   * Menambah atau update nilai mata pelajaran
   * @param {string} subject - Nama mata pelajaran
   * @param {number} score - Nilai (0-100)
   */
  addGrade(subject, score) {
    const normalizedSubject = String(subject ?? '').trim();
    if (!normalizedSubject) {
      throw new Error('Nama mata pelajaran tidak boleh kosong.');
    }

    const numericScore = Number(score);
    if (
      !Number.isFinite(numericScore) ||
      numericScore < 0 ||
      numericScore > 100
    ) {
      throw new Error('Nilai harus berupa angka antara 0 dan 100.');
    }

    this.#grades[normalizedSubject] = numericScore;
  }

  /**
   * Menghitung rata-rata nilai dari semua mata pelajaran
   * @returns {number} Rata-rata nilai
   */
  getAverage() {
    const scores = Object.values(this.#grades);
    if (scores.length === 0) {
      return 0;
    }
    const total = scores.reduce((sum, value) => sum + value, 0);
    return Number((total / scores.length).toFixed(2));
  }

  /**
   * Menentukan status kelulusan siswa
   * @returns {string} "Lulus" atau "Tidak Lulus"
   */
  getGradeStatus() {
    return this.getAverage() >= 75 ? 'Lulus' : 'Tidak Lulus';
  }

  /**
   * Menampilkan informasi lengkap siswa
   */
  displayInfo() {
    console.log(`ID: ${this.#id}`);
    console.log(`Nama: ${this.#name}`);
    console.log(`Kelas: ${this.#class}`);
    console.log('Mata Pelajaran:');
    if (Object.keys(this.#grades).length === 0) {
      console.log('  (Belum ada nilai)');
    } else {
      Object.entries(this.#grades).forEach(([subject, score]) => {
        console.log(`  - ${subject}: ${score}`);
      });
    }
    console.log(`Rata-rata: ${this.getAverage()}`);
    console.log(`Status: ${this.getGradeStatus()}`);
    console.log('------------------------');
  }

  /**
   * Menghasilkan representasi JSON untuk persistence
   * @returns {object}
   */
  toJSON() {
    return {
      id: this.#id,
      name: this.#name,
      class: this.#class,
      grades: { ...this.#grades },
    };
  }
}

export default Student;
