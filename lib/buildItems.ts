import { existsSync } from "https://deno.land/std@0.221.0/fs/exists.ts";
import { stringify } from "https://deno.land/x/xml@2.1.3/mod.ts";

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
const page = prompt("Halaman:") ?? "0";
const limit = prompt("Batas Data:") ?? "5";

export default async function buildItems(prodi: string) {
  const fetchGroupData: BatchResultsType = await fetchData(
    baseURLProdi,
    prodi,
    page,
    limit
  );

  if (prodi === "") {
    Deno.exit(0);
  }

  if (!existsSync(`./archives/${folderName}`, { isDirectory: true })) {
    Deno.mkdirSync(`./archives/${folderName}`);
  }

  for (const data of fetchGroupData.results) {
    if (!existsSync(`./archives/${folderName}/item_${data.npm}`)) {
      Deno.mkdirSync(`./archives/${folderName}/item_${data.npm}`);
    }

    const fetchIndividualItem: ETDItem = await getIndividualItem(
      baseURLItem,
      data.npm
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
            "#text": fetchIndividualItem.result?.metadata.tglUpload
              .split(" ")
              .at(0),
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
            "#text":
              fetchIndividualItem.result?.pembimbing[0]?.namaDosen ??
              "Tidak ada Data Dosen",
          },
          {
            "@element": "contributor",
            "@qualifier": "advisor",
            "#text":
              fetchIndividualItem.result?.pembimbing[1]?.namaDosen ??
              "Tidak ada Data Dosen",
          },
        ],
      },
    };

    const metaDataResult = stringify(constructMetadata);

    Deno.writeTextFile(
      `./archives/${folderName}/item_${data.npm}/dublin_core.xml`,
      metaDataResult
    );

    Deno.writeTextFile(`./archives/${folderName}/item_${data.npm}/collections`, "kandaga/133")
  }
}

console.log(jenjang[0])