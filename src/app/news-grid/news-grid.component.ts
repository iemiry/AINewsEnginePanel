import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { NewsService, Haber } from '../services/news.service';
import { NewsDialogComponent } from './news-dialog.component';

@Component({
  selector: 'app-news-grid',
  standalone: true,
  imports: [
    CommonModule, 
    HttpClientModule, 
    MatTableModule, 
    MatButtonModule, 
    MatDialogModule, 
    MatIconModule, 
    MatSnackBarModule,
    MatPaginatorModule
  ],
  templateUrl: './news-grid.component.html',
  styleUrls: ['./news-grid.component.css']
})
export class NewsGridComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  dataSource = new MatTableDataSource<Haber>([]);
  displayedColumns: string[] = ['baslik', 'icerik', 'yayinTarihi', 'kategoriId', 'actions'];

  constructor(
    private newsService: NewsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadNews();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    // Sayfa başına 10 öğe göster
    this.paginator.pageSize = 10;
  }

  loadNews(): void {
    this.newsService.getNews().subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: (err) => {
        console.error('Haberler yüklenemedi:', err);
        this.snackBar.open('Haberler yüklenemedi', 'Kapat', { duration: 3000 });
      }
    });
  }

  openNewsDialog(haber: Haber): void {
    const dialogRef = this.dialog.open(NewsDialogComponent, {
      width: '600px',
      data: haber
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'approve') {
        this.approveNews(haber.id);
      }
    });
  }

  approveNews(id: number): void {
    this.newsService.approveNews(id).subscribe({
      next: (updatedHaber) => {
        const currentData = this.dataSource.data;
        const index = currentData.findIndex((h: Haber) => h.id === id);
        if (index !== -1) {
          currentData[index] = updatedHaber;
          this.dataSource.data = [...currentData]; // Trigger change detection
        }
        this.snackBar.open('Haber onaylandı', 'Kapat', { duration: 3000 });
        console.log(`Haber ${id} onaylandı`);
      },
      error: (err) => {
        console.error('Haber onaylanamadı:', err);
        this.snackBar.open('Haber onaylanamadı', 'Kapat', { duration: 3000 });
      }
    });
  }

  truncateText(text: string, maxLength: number = 50): string {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  }
}