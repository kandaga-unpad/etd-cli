export interface ETDItem {
  result: Result;
}

export interface Result {
  metadata: Metadata;
  pembimbing: Pembimbing[];
  penguji: Penguji[];
}

export interface Metadata {
  idControl: number;
  fakultas: string;
  kodeProdi: string;
  programStudi: string;
  jenjang: string;
  jenis: string;
  npm: string;
  author: string;
  tglUpload: string;
  tahun: number;
  stPublikasi: number;
  idRepoLama: number;
  status: string;
  linkPath: string;
  fileCover: string;
  fileAbstrak: string;
  fileDaftarIsi: string;
  fileBab1: string;
  fileBab2: string;
  fileBab3: string;
  fileBab4: string;
  fileBab5: string;
  fileBab6: string | null;
  fileLampiran: string;
  filePustaka: string;
  fileSurat: string;
  fileSuratIsi: string;
  filePengesahan: string | null;
  judul: string;
  abstrak: string;
  title: string;
  abstract: string;
  keywords: string;
}

export interface Pembimbing {
  npm: string;
  namaMahasiswa: string;
  kodeDosenPembimbing: string;
  namaDosen: string;
  nidnDosen: string;
  pembimbingKetua: number;
}

export interface Penguji {
  npm: string;
  namaMahasiswa: string;
  kodeDosenPenguji: string;
  namaDosenPenguji: string;
  dosenNidn: string;
  pengujiKetua: number;
}

export default async function getIndividualItem(url: string, npm: string) {
  const getIndividualItem = await fetch(url + npm);
  const itemResult: ETDItem = await getIndividualItem.json();
  return itemResult;
}
