import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BanHangService {
  public url = 'http://localhost:8080/api/v1/chi_tiet_san_pham';
  public hoaDonUrl = 'http://localhost:8080/api/v1/hoa-don';
  public voucherUrl = 'http://localhost:8080/api/v1/voucher';
  public thanhToanUrl = 'http://localhost:8080/api/v1/phuong-thuc-thanh-toan';
  public khachHangUrl = 'http://localhost:8080/api/v1/khach-hang';

  constructor(private http: HttpClient) { }
  //phương thức gọi api lấy danh sách sản phẩm
  getSanPham(pageSize: number, pageNumber: number, ten?: string,ma?:string): Observable<any> {
    return this.http.get(`${this.url}/get-by-trang-thai?size=${pageSize}&page=${pageNumber}&ten=${ten}&ma=${ma}`);
  }
  getHoaDon():Observable<any>{
    return this.http.get(`${this.hoaDonUrl}/getAll`);
  }
  getChiTietHoaDon(id:number):Observable<any>{
    return this.http.get(`${this.hoaDonUrl}/get-chi-tiet-hoa-don/${id}`);
  }
  getVoucher():Observable<any>{
    return this.http.get(`${this.voucherUrl}/getAll`);
  }
  getPhuongThucThanhToan():Observable<any>{
    return this.http.get(`${this.thanhToanUrl}/getAll`);
  }
  createHoaDon(hoaDonData: any):Observable<any>{
    return this.http.post(`${this.hoaDonUrl}/create`,hoaDonData);
  }
  removeHoaDon(idHoaDon:number):Observable<any>{
    return this.http.put(`${this.hoaDonUrl}/huy-hoa-don/${idHoaDon}`,{});
  }
  selectProduct(idSanPham:number,sanPhamData:any):Observable<any>{
    return this.http.post(`${this.hoaDonUrl}/chon-san-pham/${idSanPham}`,sanPhamData);
  }
  removeHoaDonChiTiet(idHoaDonChiTiet:number):Observable<any>{
    return this.http.delete(`${this.hoaDonUrl}/delete-hoa-don-chi-tiet/${idHoaDonChiTiet}`);
  }
  removeSoLuongHoaDonChiTiet(idHoaDonChiTiet:number):Observable<any>{
    return this.http.put(`${this.hoaDonUrl}/delete-single-san-pham/${idHoaDonChiTiet}`,{});
  }
  thanhToanHoaDOn(idHoaDon:number,hoaDonData:any):Observable<any>{
    return this.http.put(`${this.hoaDonUrl}/thanh-toan/${idHoaDon}`,hoaDonData);
  }
  getKhachHang(pageSize:number,pageNumber:number,search?:String):Observable<any>{
    return this.http.get(`${this.khachHangUrl}/getAllKhachHang_PhanTrang_TimKiem?page=${pageNumber}&size=${pageSize}&ten=${search}`);
  }
}
                                                               