// deno-lint-ignore-file no-explicit-any
import { existsSync } from "https://deno.land/std@0.221.0/fs/exists.ts";
import { stringify } from "https://deno.land/x/xml@2.1.3/mod.ts";
import { download } from "https://deno.land/x/download@v2.0.2/mod.ts";
// import { compress } from "https://deno.land/x/zip@v1.2.5/mod.ts";

// Local Lib
import fetchData from "./fetchData.ts";
import getIndividualItem from "./fetchItem.ts";
import jenjang from "../jenjang.json" with { type: "json" };

// Type of each items
import type { BatchResultsType } from "./fetchData.ts";
import type { ETDItem } from "./fetchItem.ts";

const folderName = prompt("Nama Folder:");

const baseURLProdi = "https://kandaga.unpad.ac.id:4233/api/etd/prodi/";
const baseURLItem = "https://kandaga.unpad.ac.id:4233/api/etd/individu/";
const limit = prompt(
  "Batas Data (Pastikan Batas Data Konsisten untuk menghindari Duplikasi):",
) ?? "5";
const page = prompt("Halaman (Halaman / Page berdasarkan Batas Data):") ?? "0";
const getIndexPage = (Number(page) - 1) * Number(limit) +
  (page === "0" ? 0 : 1);

// Helper Functions
function formatBytes(bytes: number, decimals = 2) {
  if (!bytes) return "0 bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [
    "Bytes",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
    "PiB",
    "EiB",
    "ZiB",
    "YiB",
  ];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function getHandleCollection(kodeProdi: string) {
  const getDataProdi = jenjang.find((data) =>
    data.kodeProdi === Number(kodeProdi)
  );
  return getDataProdi?.kodeDSpace;
}

// Build Repository Items for SAF
export default async function buildItems(prodi: string) {
  if (prodi === "") {
    console.log("Program Dihentikan! Kode Prodi tidak valid!");
    Deno.exit(0);
  }

  const fetchGroupData: BatchResultsType = await fetchData(
    baseURLProdi,
    prodi,
    String(getIndexPage),
    limit,
  );

  if (!existsSync(`./archives/${folderName}`, { isDirectory: true })) {
    Deno.mkdirSync(`./archives/${folderName}`);
  }

  const getNamaProdi = () => {
    return jenjang.find((item) => {
      return item.kodeProdi === Number(prodi);
    });
  };

  console.log(
    `Persiapan mengunduh Tugas Akhir Program Studi %c${getNamaProdi()?.programStudi} %cpada halaman ${getIndexPage} dengan batas data ${limit} koleksi.`,
    "color: green",
    "color: white",
  );

  for (const data of fetchGroupData.results) {
    if (!existsSync(`./archives/${folderName}/item_${data.npm}`)) {
      Deno.mkdirSync(`./archives/${folderName}/item_${data.npm}`);
    }
    console.log("Memuat Data yang akan dikoleksi...");

    const fetchIndividualItem: ETDItem = await getIndividualItem(
      baseURLItem,
      data.npm,
    );
    const constructMetadata = {
      dublin_core: {
        dcvalue: [
          {
            "@element": "title",
            "#text": fetchIndividualItem?.result.metadata.judul,
          },
          {
            "@element": "date",
            "@qualifier": "issued",
            "#text":
              fetchIndividualItem.result?.metadata.tglUpload?.split(" ").at(
                0,
              ) ??
                "20" +
                  fetchIndividualItem.result?.metadata.npm.split("").at(6) +
                  fetchIndividualItem.result?.metadata.npm.split("").at(7),
          },
          {
            "@element": "description",
            "@qualifier": "abstract",
            "#text": fetchIndividualItem.result?.metadata.abstract.trim(),
          },
          {
            "@element": "contributor",
            "@qualifier": "author",
            "#text": fetchIndividualItem.result?.metadata.author,
          },
          {
            "@element": "contributor",
            "@qualifier": "advisor",
            "#text": fetchIndividualItem.result?.pembimbing[0]?.namaDosen ??
              "Tidak ada Data Dosen",
          },
          {
            "@element": "contributor",
            "@qualifier": "advisor",
            "#text": fetchIndividualItem.result?.pembimbing[1]?.namaDosen ??
              "Tidak ada Data Dosen",
          },
          {
            "@element": "subject",
            "#text":
              fetchIndividualItem.result?.metadata.keywords.split(",").at(0) ??
                "Tidak ada keyword",
          },
          {
            "@element": "subject",
            "#text":
              fetchIndividualItem.result?.metadata.keywords.split(",").at(1) ??
                "Tidak ada keyword",
          },
          {
            "@element": "subject",
            "#text":
              fetchIndividualItem.result?.metadata.keywords.split(",").at(2) ??
                "Tidak ada keyword",
          },
        ],
      },
    };

    const metaDataResult = stringify(constructMetadata);
    const metaDataList = fetchIndividualItem.result.metadata;

    Deno.writeTextFile(
      `./archives/${folderName}/item_${data.npm}/contents`,
      "",
    );

    for (const listData in metaDataList) {
      if (listData.includes("file")) {
        if ((metaDataList as any)[listData] !== null) {
          const urlFile = `${metaDataList["linkPath"]}${
            (metaDataList as any)[listData]
          }`;
          const fileName = `${
            metaDataList.jenjang === "Sarjana"
              ? "S1"
              : metaDataList.jenjang === "Magister"
              ? "S2"
              : metaDataList.jenjang === "Doktor"
              ? "S3"
              : metaDataList.jenjang === "Spesialis-1"
              ? "SPESIALIS"
              : metaDataList.jenjang === "Subspesialis"
              ? "SUBSPESIALIS"
              : metaDataList.jenjang === "Diploma III"
              ? "DIPLOMA"
              : metaDataList.jenjang === "Diploma IV"
              ? "DIPLOMA"
              : "Unpad"
          }-${metaDataList.tahun}-${metaDataList.npm}-${
            listData.replace("file", "")
          }`;

          switch (listData) {
            case "fileCover":
            case "fileAbstrak":
            case "fileDaftarIsi":
            case "fileBab1":
            case "filePustaka":
            case "filePengesahan":
              Deno.writeTextFile(
                `./archives/${folderName}/item_${data.npm}/contents`,
                fileName + ".pdf\tpermissions:-r 'Anonymous'\r\n",
                {
                  append: true,
                },
              );
              break;
            case "fileBab2":
            case "fileBab3":
            case "fileBab4":
            case "fileBab5":
            case "fileBab6":
            case "fileLampiran":
            case "fileSurat":
            case "fileSuratIsi":
              Deno.writeTextFile(
                `./archives/${folderName}/item_${data.npm}/contents`,
                fileName + `.pdf\tpermissions:-r 'Mahasiswa'\r\n`,
                {
                  append: true,
                },
              );
              break;
            default:
              Deno.writeTextFile(
                `./archives/${folderName}/item_${data.npm}/contents`,
                fileName + ".pdf\r\n",
                {
                  append: true,
                },
              );
              break;
          }

          const downloadedFile = await download(urlFile, {
            dir: `./archives/${folderName}/item_${data.npm}`,
            file: `${fileName}.pdf`,
          });
          console.log(
            `${downloadedFile.file} (${
              formatBytes(downloadedFile.size)
            }) telah berhasil diunduh!`,
          );
        } else {
          console.log(
            `%cBerkas ${listData} tidak ditemukan! melanjutkan ke unduhan selanjutnya...`,
            "color: red",
          );
        }
      }
    }

    Deno.writeTextFile(
      `./archives/${folderName}/item_${data.npm}/dublin_core.xml`,
      metaDataResult,
    );

    Deno.writeTextFile(
      `./archives/${folderName}/item_${data.npm}/collections`,
      `kandaga/${getHandleCollection(data.kodeProdi)}`,
    );

    Deno.writeTextFile(
      `./archives/${folderName}/item_${data.npm}/handle`,
      `kandaga/${data.npm}`,
    );

    console.log(
      `Pengambilan Data Berhasil! Data tersimpan ke %c"item_${data.npm}" %cdi folder %c"${folderName}"`,
      "color: green",
      "color: white",
      "color: blue",
    );
  }

  const remaining = fetchGroupData.total - (getIndexPage * Number(limit));

  console.log(
    'Seluruh Data Berhasil diambil, silahkan cek folder %c"' + folderName +
      '".',
    "color: blue",
  );

  // const folderList = [];
  // for await (const folder of Deno.readDir(`./archives/${folderName}`)) {
  //   folderList.push(`./archives/${folderName}/${folder.name}`);
  // }

  // if (folderList.length > 0) {
  //   await compress(`./archives/${folderName}/`, `./archives/${folderName}.zip`);
  //   const zipSize = await Deno.stat(`./archives/${folderName}.zip`);
  //   console.log(
  //     "File sudah dikompres ke " + folderName + ".zip %c(" +
  //       formatBytes(zipSize.size) + ")",
  //     "color: yellow",
  //   );
  // }

  console.log(
    `Halaman: %c${page} %c- Batas Data: %c${limit}`,
    "color: green; font-weight: bold;",
    "color:white",
    "color: red; font-weight: bold",
  );
  console.log(`%cTersisa : "${remaining}" yang perlu diunduh!`, "color: green");
}
