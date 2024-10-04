import { Component, OnInit } from '@angular/core';
import { BanHangService } from 'app/ban-hang.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ban-hang',
  templateUrl: './ban-hang.component.html',
  styleUrls: ['./ban-hang.component.css']
})
export class BanHangComponent implements OnInit {
  product: any[] = [];
  pagination: any = [];
  searchTerm: string = '';
  hoaDon: any[] = [];
  chitietHoaDon: any[] = [];
  hasError: boolean = false;
  activeInvoidID: number | null = null;
  tongTienBanDau: number = 0;
  tongTienSauVoucher: number = 0;
  tenKhachHang: string = '';
  tienKhachDua: number = 0;
  tienTraLai: number = 0;
  tienKhachDuaInvalid: boolean = false;
  voucher: any[] = [];
  phuongThucThanhToan: any[] = [];
  icon: string = 'toggle_off';
  checkHoaDon: boolean = false;
  selectedVoucherId: number | null = null;
  idThanhToan: number = 0;
  idGiaoHang: number = 0;

  hoaDonMoi: any = {
    idKhachHang: 0,
    idNhanVien: 0
  };

  hoaDonChiTietMoi: any = {
    hoaDon: 0,
    chiTietSanPham: 0,
    ma: '',
    soLuong: 0,
    giaSpctHienTai: 0,
    trangThai: ''
  };

  constructor(private banHangService: BanHangService) { }

  ngOnInit() {
    this.getSanPham();
    this.getHoaDon();
    this.getVoucher();
    this.getPhuongThucThanhToan();
    this.toggleIcon();
  }

  toggleIcon() {
    this.icon = this.icon === 'toggle_off' ? 'toggle_on' : 'toggle_off';
    this.idGiaoHang = this.icon === 'toggle_on'?1:0;
  }

  // ====================== Lấy dữ liệu bán hàng ====================

  getSanPham(pageSize: number = 0, pageNumber: number = 5, searchTen: string = '', searchMa: string = ''): void {
    this.banHangService.getSanPham(pageSize, pageNumber, searchTen, searchMa).subscribe(
      data => {
        this.product = data.result.content.content;
        this.pagination = data.result.pagination;
      },
      this.handleError // Xử lý lỗi dùng phương thức riêng
    );
  }

  searchProduct(): void {
    this.getSanPham(0, 5, this.searchTerm, this.searchTerm);
  }

  getHoaDon(): void {
    this.banHangService.getHoaDon().subscribe(
      data => {
        this.hoaDon = data.result.content;
        if (this.hoaDon.length > 0) {
          this.getChiTietHoaDon(this.hoaDon[0].id);
          this.checkHoaDon = false;
        } else {
          this.checkHoaDon = true;
        }
      },
      this.handleError
    );
  }

  getChiTietHoaDon(id: number): void {
    this.banHangService.getChiTietHoaDon(id).subscribe(
      data => {
        this.chitietHoaDon = data.result.content;
        this.activeInvoidID = id;
        if (this.chitietHoaDon.length > 0) {
          const hoaDonData = data.result.content[0].hoaDon;
          this.tongTienBanDau = hoaDonData.tongTienBanDau;
          this.tongTienSauVoucher = hoaDonData.tongTienBanDau;
          this.tienKhachDua = this.tongTienSauVoucher;
          this.tenKhachHang = hoaDonData.khachHang.ten;
          this.hasError = false;
        } else {
          this.resetHoaDonData();
        }
      },
      this.handleError
    );
  }

  getVoucher(): void {
    this.banHangService.getVoucher().subscribe(
      data => this.voucher = data.result.content.content,
      this.handleError
    );
  }

  getPhuongThucThanhToan(): void {
    this.banHangService.getPhuongThucThanhToan().subscribe(
      data => this.phuongThucThanhToan = data.result.content,
      this.handleError
    );
  }

  getTienTraLai(tienKhachDua: number): void {
    if (isNaN(tienKhachDua) || tienKhachDua <= 0) {
      this.tienKhachDuaInvalid = true;
      this.tienTraLai = 0;
    } else {
      this.tienKhachDuaInvalid = false;
      this.tienTraLai = Math.max(0, tienKhachDua - this.tongTienSauVoucher);
    }
  }

  onInputChange(event: any): void {
    const selectedValue = event.target.value;
    const selectedVoucher = this.voucher.find(v => v.ten === selectedValue);
    this.selectedVoucherId = selectedVoucher ? selectedVoucher.id : null;

    if (selectedVoucher) {
      let discountValue: number;

      // Kiểm tra kiểu giảm giá của voucher
      if (selectedVoucher.kieuGiamGia === '%') {
        // Nếu là phần trăm, tính giá trị giảm dựa trên phần trăm
        discountValue = this.tongTienBanDau * (selectedVoucher.giaTriVoucher / 100);
      } else {
        // Nếu là giảm tiền trực tiếp, lấy giá trị của voucher
        discountValue = selectedVoucher.giaTriVoucher;
      }

      // Đảm bảo giảm giá không vượt quá giá trị tối đa mà voucher cho phép
      const finalDiscount = Math.min(discountValue, selectedVoucher.giaTriGiamToiDa);

      // Kiểm tra điều kiện áp dụng voucher (nếu cần)
      if (this.tongTienBanDau >= selectedVoucher.giaTriHoaDonToiThieu) {
        // Tính tổng tiền sau khi áp dụng voucher
        this.tongTienSauVoucher = this.tongTienBanDau - finalDiscount;
      } else {
        // Nếu không đạt điều kiện, tổng tiền không thay đổi
        this.tongTienSauVoucher = this.tongTienBanDau;
      }
    } else {
      // Nếu không có voucher được chọn, tổng tiền sau voucher bằng tổng tiền ban đầu
      this.tongTienSauVoucher = this.tongTienBanDau;
    }
  }
  //lấy phương thức thanh toán
  getIdThanhToan(idThanhToan: number): void {
    this.idThanhToan = idThanhToan;
  }

  // =================== Thông báo ===================

  showSuccessMessage(message: string) {
    Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: message,
      showConfirmButton: false,
      timer: 1500
    });
  }

  showErrorMessage(message: string) {
    Swal.fire({
      icon: 'error',
      title: 'Thất bại!',
      text: message,
      showConfirmButton: false,
      timer: 1500
    });
  }

  showWarningMessage(message: string) {
    Swal.fire({
      icon: 'warning',
      title: 'Thất bại!',
      text: message,
      showConfirmButton: false,
      timer: 1500
    });
  }

  // ================= Tạo và hủy hóa đơn =================

  createHoaDon(): void {
    const hoaDonData = {
      idKhachHang: 0,
      idNhanVien: 1,
      idVoucher: this.selectedVoucherId || 0,
      idThanhToan: 0,
      ma: '',
      tongTienBanDau: 0,
      phiShip: 0,
      tongTienSauVoucher: 0,
      tenNguoiNhan: '',
      sdtNguoiNhan: '',
      emailNguoiNhan: '',
      diaChiNhanHang: '',
      ngayNhanDuKien: '',
      thoiGianTao: '',
      giaoHang: 0,
      ghiChu: '',
      trangThai: ''
    };
    this.banHangService.createHoaDon(hoaDonData).subscribe(
      response => {
        this.showSuccessMessage('Tạo hóa đơn thành công!');
        this.getHoaDon();
      },
      this.handleError
    );
  }

  removeHoaDon(idHoaDon: number): void {
    if (confirm('bạn có chắc chắn muốn hủy hóa đơn này không?')) {
      this.banHangService.removeHoaDon(idHoaDon).subscribe(
        response => {
          this.showSuccessMessage('Hủy hóa đơn thành công');
          this.getHoaDon();
          this.getSanPham();
        },
        this.handleError
      );
    }
  }

  // ================= Chọn sản phẩm =================

  selectProduct(idSanPham: number): void {
    // Hiển thị hộp thoại để nhập số lượng
    const soLuongNhap = window.prompt('Nhập số lượng sản phẩm:', '1');

    // Kiểm tra nếu người dùng đã nhập số lượng
    if (soLuongNhap !== null) {
      const soLuong = Number(soLuongNhap);

      if (!isNaN(soLuong) && soLuong > 0) {  // Kiểm tra số lượng hợp lệ
        const selectedProduct = {
          hoaDon: this.activeInvoidID,
          chiTietSanPham: idSanPham,
          ma: '',
          soLuong: soLuong,
          giaSpctHienTai: 0,
          trangThai: 'Đang xử lý'
        };

        // Gọi service để chọn sản phẩm với số lượng đã nhập
        this.banHangService.selectProduct(idSanPham, selectedProduct).subscribe(
          response => {
            this.showSuccessMessage('Chọn sản phẩm thành công!');
            this.getHoaDon();  // Cập nhật lại hóa đơn sau khi chọn sản phẩm
            this.getSanPham();
          },
          this.handleError
        );
      } else {
        this.showErrorMessage('Số lượng không hợp lệ! Vui lòng nhập lại.');
      }
    }
  }
  increaseQuantity(idSanPham: number): void {
    const selectedProduct = {
      hoaDon: this.activeInvoidID,
      chiTietSanPham: idSanPham,
      ma: '',
      soLuong: 1,
      giaSpctHienTai: 0,
      trangThai: 'Đang xử lý'
    };

    // Gọi service để chọn sản phẩm với số lượng đã nhập
    this.banHangService.selectProduct(idSanPham, selectedProduct).subscribe(
      response => {
        this.getHoaDon();
        this.getSanPham();
      },
      error => {
        console.log('lỗi thêm sản phẩm!');
      }
    );
  }
  decreaseQuantity(idChiTietHoaDon: number): void {
    this.banHangService.removeSoLuongHoaDonChiTiet(idChiTietHoaDon).subscribe(
      response => {
        this.getHoaDon();
        this.getSanPham();
      },
      error => {
        console.log('lỗi xóa sản phẩm!');
        this.showWarningMessage('số lượng sản phẩm đã hết');
      }
    )
  }

  //==================xóa hóa đơn chi tiết==================
  removeHoaDonChiTiet(idHoaDonChiTiet: number) {
    if (confirm('bạn có chắc muốn xóa sản phẩm này không?')) {
      this.banHangService.removeHoaDonChiTiet(idHoaDonChiTiet).subscribe(
        response => {
          this.showSuccessMessage('xóa thành công!');
          this.getHoaDon();
          this.getSanPham();
        },
        error => {
          this.showErrorMessage('xóa sản phẩm thất bại!');
          console.log('lỗi xóa hóa đơn chi tiết', error);
        }
      )
    }
  }
  //==================Thanh toán hóa đơn==================
  thanhtoanHoaDon(idHoaDon: number): void {
    if (this.tienKhachDua < this.tongTienSauVoucher) {
      this.showErrorMessage('Số tiền khách đưa không đủ!');
      return;
    }
    console.log(this.idGiaoHang);
    // Cập nhật thông tin hóa đơn để thanh toán
    const hoaDonData = {
      idKhachHang: 0, // Cập nhật giá trị thực tế của khách hàng
      idNhanVien: 1, // Cập nhật giá trị thực tế của nhân viên
      idVoucher: this.selectedVoucherId || null,
      idThanhToan: this.idThanhToan || 0, // Phương thức thanh toán mặc định
      ma: this.hoaDonChiTietMoi.hoaDon.ma, // Mã hóa đơn chi tiết hiện tại
      tongTienBanDau: this.tongTienBanDau,
      phiShip: 0, // Thêm phí ship nếu cần
      tongTienSauVoucher: 0,
      tenNguoiNhan: this.tenKhachHang, // Tên khách hàng
      sdtNguoiNhan: '', // Cập nhật số điện thoại nếu có
      emailNguoiNhan: '', // Cập nhật email nếu có
      diaChiNhanHang: '', // Cập nhật địa chỉ nếu có
      ngayNhanDuKien: '', // Cập nhật ngày nhận dự kiến nếu có
      thoiGianTao: "", // Thời gian tạo hóa đơn
      giaoHang: this.idGiaoHang || 0, // Trạng thái giao hàng
      ghiChu: '', // Thêm ghi chú nếu có
      trangThai: '' // Trạng thái sau khi thanh toán
    };

    // Gọi service để thanh toán hóa đơn
    this.banHangService.thanhToanHoaDOn(idHoaDon, hoaDonData).subscribe(
      response => {
        this.showSuccessMessage('Thanh toán hóa đơn thành công!');
        this.getHoaDon(); // Cập nhật lại danh sách hóa đơn sau khi thanh toán
        this.getSanPham(); // Cập nhật lại danh sách sản phẩm
      },
      error => {
        this.handleError(error); // Xử lý lỗi nếu có
        this.showErrorMessage('Thanh toán thất bại! Vui lòng thử lại.');
      }
    );
  }



  // ================= Xử lý lỗi =================

  handleError(error: any): void {
    console.error('Error occurred', error);
    this.showErrorMessage('Có lỗi xảy ra. Vui lòng thử lại!');
  }

  resetHoaDonData(): void {
    this.tongTienBanDau = 0;
    this.tongTienSauVoucher = 0;
    this.tenKhachHang = '';
    this.tienKhachDua = 0;
    this.tienTraLai = 0;
    this.hasError = true;
  }
}
