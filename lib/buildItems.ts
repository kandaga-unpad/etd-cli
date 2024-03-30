import { existsSync } from "https://deno.land/std@0.221.0/fs/exists.ts";
import { stringify } from "https://deno.land/x/xml@2.1.3/mod.ts";

// Local Lib
import fetchData from "./fetchData.ts";
import getIndividualItem from "./fetchItem.ts";

// Type of each items
import type { BatchResultsType } from "./fetchData.ts";
import type { ETDItem } from "./fetchItem.ts";
stringify({});

const exampleMetadata = {
  result: {
    metadata: {
      idControl: 47401,
      fakultas: "Ilmu Komunikasi",
      kodeProdi: "210810",
      programStudi: "Perpustakaan dan Sains Informasi",
      jenjang: "Sarjana",
      jenis: "Skripsi",
      npm: "210210160084",
      author: "CHRISNA ADHI PRANOTO",
      tglUpload: "2021-03-08 21:51:04",
      tahun: 2021,
      stPublikasi: 1,
      idRepoLama: 43124,
      status: "Lulus",
      linkPath: "https://repository.unpad.ac.id/thesis/210210/2016/",
      fileCover: "210210160084_c_5413.pdf",
      fileAbstrak: "210210160084_a_2592.pdf",
      fileDaftarIsi: "210210160084_d_5831.pdf",
      fileBab1: "210210160084_1_8741.pdf",
      fileBab2: "210210160084_2_4731.pdf",
      fileBab3: "210210160084_3_4632.pdf",
      fileBab4: "210210160084_4_2878.pdf",
      fileBab5: "210210160084_5_1961.pdf",
      fileBab6: null,
      fileLampiran: "210210160084_l_3377.pdf",
      filePustaka: "210210160084_k_2588.pdf",
      fileSurat: "210210160084_s_4206.pdf",
      fileSuratIsi: "210210160084_i_8771.pdf",
      filePengesahan: null,
      judul:
        "RANCANG BANGUN MEDIA INFORMASI UNTUK PERPUSTAKAAN PUSAT UNIVERSITAS PADJADJARAN:Studi Kaji Tindak (A",
      abstrak:
        "Perpustakaan merupakan sebuah lembaga yang menjadi pusat dari sumber bahan pustaka ilmiah dan inform",
      title:
        "RANCANG BANGUN MEDIA INFORMASI UNTUK PERPUSTAKAAN PUSAT UNIVERSITAS PADJADJARAN:Studi Kaji Tindak (A",
      abstract:
        "Perpustakaan merupakan sebuah lembaga yang menjadi pusat dari sumber bahan pustaka ilmiah dan inform",
      keywords:
        "Media Informasi, Pengembangan Media, Layanan Perpustakaan Digital",
    },
    pembimbing: [
      {
        npm: "210210160084",
        namaMahasiswa: "CHRISNA ADHI PRANOTO",
        kodeDosenPembimbing: "K03A10019",
        namaDosen: "Edwin Rizal ",
        nidnDosen: "0008016801",
        pembimbingKetua: 1,
      },
      {
        npm: "210210160084",
        namaMahasiswa: "CHRISNA ADHI PRANOTO",
        kodeDosenPembimbing: "K03A10037",
        namaDosen: "Rully Khairul Anwar ",
        nidnDosen: "0024027504",
        pembimbingKetua: 0,
      },
    ],
    penguji: [
      {
        npm: "210210160084",
        namaMahasiswa: "CHRISNA ADHI PRANOTO",
        kodeDosenPenguji: "K03A10019",
        namaDosenPenguji: "Edwin Rizal ",
        dosenNidn: "0008016801",
        pengujiKetua: 1,
      },
    ],
  },
};

const folderName = prompt("Nama Folder:");

if (!existsSync(`../${folderName}`)) {
  Deno.mkdirSync(`../${folderName}`);
  if (
    !existsSync(`../${folderName}/item_${exampleMetadata.result.metadata.npm}`)
  ) {
    Deno.mkdirSync(
      `../${folderName}/item_${exampleMetadata.result.metadata.npm}`
    );
  }
}
// Deno.writeTextFileSync(
//   `../${folderName}/item_${exampleMetadata.result.metadata.npm}/dublin_core.xml`,
//   getMetadataXML
// );

const baseURLProdi = "https://kandaga.unpad.ac.id:4233/api/etd/prodi/";
const baseURLItem = "https://kandaga.unpad.ac.id:4233/api/etd/individu/";
const page = prompt("Halaman:") ?? "0";
const limit = prompt("Batas Data:") ?? "5";

export default async function buildItems(prodi: string) {
  const fetchGroupData: BatchResultsType = await fetchData(
    baseURLProdi,
    prodi,
    page,
    limit
  );

  if (!existsSync(`../${folderName}`, { isDirectory: true })) {
    Deno.mkdirSync(`../${folderName}`);
  }

  for (const data of fetchGroupData.results) {
    const fetchIndividualItem: ETDItem = await getIndividualItem(
      baseURLItem,
      data.npm
    );
    const _constructMetadata = {
      dublin_core: {
        dcvalue: [
          {
            "@attribute": "title",
            "#text": fetchIndividualItem.result.metadata.judul,
          },
          {
            "@element": "date",
            "@qualifier": "issued",
            "#text": fetchIndividualItem.result.metadata.tglUpload
              .split(" ")
              .at(0),
          },
          {
            "@element": "description",
            "@qualifier": "abstract",
            "#text": fetchIndividualItem.result.metadata.abstract,
          },
        ],
      },
    };
  }
}
