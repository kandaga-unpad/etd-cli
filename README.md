# ETD CLI for Harvesting Data Unpad

Command Line Interface for harvesting data from Internal SIAT Unpad.
Built and Compiled with [Deno](https://deno.com)

Example :
```
Nama Folder : 110110_1-10
Batas Data : 10
Halaman : 1
Kode Prodi : 110110
```

Nama Folder Format :
`KodeProdi_UrutanPertama-UrutanTerakhir`

Batas Data (berisi angka untuk batas data per halaman):
`10`

Halaman (halaman berdasarkan batas data) :
`1`

Kode Prodi :
`110110` untuk Program Studi Sarjana Hukum (berdasarkan npm)

## ZIP File

Hasil akan berada di folder `archive/{Nama Folder}/{Daftar Item}` silahkan zip folder tersebut sehingga akan menjadi SAF (Simple Archive Format) untuk DSpace.
