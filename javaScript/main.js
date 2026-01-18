let title = document.getElementById("title");
let price = document.getElementById("price");
let taxes = document.getElementById("taxes");
let ads = document.getElementById("ads");
let discount = document.getElementById("discount");
let total = document.getElementById("total");
let count = document.getElementById("count");
let category = document.getElementById("category");
let submit = document.getElementById("submit");
let mood = "create";
let tmp;

//get Total
function getTotal() {
  if (price.value != "") {
    let result = +price.value + +taxes.value + +ads.value - +discount.value;
    total.innerHTML = result;
    total.style.backgroundColor = "#147cf3ff";
  } else {
    total.innerHTML = "";
    total.style.backgroundColor = "rgb(236, 161, 9)";
  }
}

// Create Product
let dataPro;
if (localStorage.productf != null) {
  dataPro = JSON.parse(localStorage.productf);
} else {
  dataPro = [];
}

submit.onclick = function () {
  let newPro = {
    title: title.value.toLowerCase(),
    price: price.value,
    taxes: taxes.value,
    ads: ads.value,
    discount: discount.value,
    total: total.innerHTML,
    count: count.value,
    category: category.value.toLowerCase(),
    // .toUpperCase()
    Date: new Date()
      .toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // اجعلها false إذا كنت تريد نظام 24 ساعة
      })
      .replace(/(\d+)\/(\d+)\/(\d+),/, "$3/$2/$1"),

    // Date: new Date().toLocaleString("en-GB",{
    //   year: "numeric",
    //   month: "numeric",
    //   day: "numeric",
    //   hour: "2-digit",
    //   minute: "2-digit"
    // })
  };
  if (
    newPro.title != "" &&
    price.value != "" &&
    category.value != "" &&
    count.value < 100
  ) {
    if (mood === "create") {
      if (newPro.count > 1) {
        for (let i = 0; i < newPro.count; i++) {
          dataPro.push(newPro);
        }
      } else {
        dataPro.push(newPro);
      }
    } else {
      dataPro[tmp] = newPro;
      mood = "create";
      submit.innerHTML = "Create";
      count.style.display = "block";
    }
    clearData();
  }

  localStorage.setItem("productf", JSON.stringify(dataPro));
  console.log(dataPro);

  showData();
};

// Clear Input

function clearData() {
  title.value = "";
  price.value = "";
  taxes.value = "";
  ads.value = "";
  discount.value = "";
  total.innerHTML = "";
  count.value = "";
  category.value = "";
}
// Read
function showData() {
  getTotal();
  let table = "";
  for (let i = 0; i < dataPro.length; i++) {
    table += `
        <tr>
            <td>${i + 1}</td>
            <td>${dataPro[i].title}</td>
            <td>${dataPro[i].price}</td>
            <td>${dataPro[i].taxes}</td>
            <td>${dataPro[i].ads}</td>
            <td>${dataPro[i].discount}</td>
            <td>${dataPro[i].total}</td>
            <td>${dataPro[i].category}</td>
            <td><small style="color: #fff; font-size: 12px; display: black; margin-top: 5px;">
            🕒 ${dataPro[i].Date ? dataPro[i].Date : "UNKNOWN"}
            </small></td>
            <td><button id="update" onclick = "updateData(${i})">update</button></td>
            <td><button onclick = "deleteData(${i})" id="delete">delete</button></td>
        </tr> `;
  }
  document.getElementById("tbody").innerHTML = table;

  let btnDelete = document.getElementById("deleteAll");
  if (dataPro.length > 0) {
    btnDelete.innerHTML = `
        <button onclick = "deleteAll()">DeleteAll (${dataPro.length})</button>
        <button onclick="exportToPDF()" style="background-color: #e91e63; margin-top: 10px;">
        Download PDF Report</button>`;
  } else {
    btnDelete.innerHTML = " ";
  }
}
showData();

//////////////////////// convert To Pdf ////////////////////////////

// 7. ميزة حفظ البيانات بصيغة PDF
/**
 * دالة التصدير المحدثة لمكتبة html2pdf.js
 * تحسب إجمالي السعر الأساسي وإجمالي التكلفة النهائية
 */
function exportToPDF() {
    if (typeof html2pdf === 'undefined') {
        console.error("Library html2pdf not found");
        alert("عذراً، مكتبة PDF غير محملة");
        return;
    }

    // 1. إعداد التاريخ والوقت الحالي لعنوان التقرير
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    // تنسيق الوقت (12 ساعة مع AM/PM)
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; 

    const formattedDateTime = `${year}/${month}/${day} - ${hours}:${minutes} ${ampm}`;
    const fileName = `Daily_Report_${year}-${month}-${day}.pdf`;

    // 2. حساب إجمالي المبالغ وبناء الصفوف
    let totalBasePrice = 0;
    let tableBodyHtml = "";

    dataPro.forEach((product, index) => {
        const price = Number(product.price) || 0;
        const rowTotal = Number(product.total) || price;
        totalBasePrice += price;

        // جلب التاريخ المخزن
        const regDate = product.date || product.Date || "N/A";

        tableBodyHtml += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${index + 1}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${product.title}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd; font-weight: bold;">${price.toFixed(2)}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${product.category}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd; color: #147cf3;">${rowTotal.toFixed(2)}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd; font-size: 10px; color: #555;">${regDate}</td>
            </tr>
        `;
    });

    // 3. إنشاء تصميم التقرير (نفس صيغة كود المخرجات)
    const element = document.createElement('div');
    element.innerHTML = `
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; background: white;">
            <div style="text-align: center; border-bottom: 3px solid #147cf3; padding-bottom: 20px; margin-bottom: 20px;">
                <h1 style="color: #147cf3; margin: 0; text-transform: uppercase;">تقرير سجل المبيعات </h1>
                <p style="color: #666; margin: 5px 0; direction: ltr;">Generated on: ${formattedDateTime}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; direction: rtl;">
                <thead>
                    <tr style="background-color: #333; color: white;">
                        <th style="padding: 12px; border: 1px solid #222; width: 40px;">#</th>
                        <th style="padding: 12px; border: 1px solid #222;">اسم المنتج</th>
                        <th style="padding: 12px; border: 1px solid #222;">السعر الأساسي</th>
                        <th style="padding: 12px; border: 1px solid #222;">الفئة</th>
                        <th style="padding: 12px; border: 1px solid #222;">التكلفة الإجمالية</th>
                        <th style="padding: 12px; border: 1px solid #222;">التاريخ/الوقت</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableBodyHtml}
                </tbody>
                <tfoot>
                    <tr style="background-color: #f1f1f1; font-weight: bold;">
                        <td colspan="2" style="padding: 15px; border: 1px solid #ddd; text-align: left;">إجمالي السعر الأساسي:</td>
                        <td colspan="4" style="padding: 15px; border: 1px solid #ddd; text-align: center; color: #530303; font-size: 18px;">${totalBasePrice.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
            
            <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee; padding-top: 10px;">
                <p>البرطي - سجل المبيعات اليومي</p>
            </div>
        </div>
    `;

    // 4. إعدادات التصدير
    const opt = {
        margin:       [10, 10, 10, 10],
        filename:     fileName,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // 5. التنفيذ
    html2pdf().set(opt).from(element).save();
}
///////////////////////////////////////////////////////
// Delete

function deleteData(i) {
  dataPro.splice(i, 1);
  localStorage.productf = JSON.stringify(dataPro);
  showData();
}

// DeleteAll
function deleteAll() {
  if (confirm("هل تريد حذف كافة السجلات؟")) { 
  localStorage.clear();
  dataPro.splice(0);
  showData();
  }
}

// Update
function updateData(i) {
  title.value = dataPro[i].title;
  price.value = dataPro[i].price;
  taxes.value = dataPro[i].taxes;
  ads.value = dataPro[i].ads;
  discount.value = dataPro[i].discount;
  getTotal();
  count.style.display = "none";
  category.value = dataPro[i].category;
  submit.innerHTML = "Update";
  mood = "update";
  tmp = i;
  scroll({
    top: 0,
    behavior: "smooth",
  });
  // showSection('inputSection'); // إضافة هذا السطر هنا
  //   title.value = dataPro[i].title;
}

// Search
let searchMood = "Title";

function getSearchMood(id) {
  let search = document.getElementById("search");

  if (id == "searchTitle") {
    searchMood = "Title";
  } else {
    searchMood = "Category";
  }
  search.placeholder = "Search By " + searchMood;

  search.focus();
  search.value = "";
  showData();
  // console.log(searchMood);
}

function searchData(value) {
  let table = "";
  for (let i = 0; i < dataPro.length; i++) {
    if (searchMood == "Title") {
      if (dataPro[i].title.includes(value.toLowerCase())) {
        table += `
          <tr>
          <td>${i}</td> 
          <td>${dataPro[i].title}</td>
          <td>${dataPro[i].price}</td>
          <td>${dataPro[i].taxes}</td>
          <td>${dataPro[i].ads}</td>
          <td>${dataPro[i].discount}</td>
          <td>${dataPro[i].total}</td>
          <td>${dataPro[i].category}</td>
            <td><button id="update" onclick = "updateData(${i})">update</button></td>
            <td><button onclick = "deleteData(${i})" id="delete">delete</button></td>
            </tr> `;
      }
    } else {
      if (dataPro[i].category.includes(value.toLowerCase())) {
        table += `
            <tr>
            <td>${i}</td>
            <td>${dataPro[i].title}</td>
            <td>${dataPro[i].price}</td>
            <td>${dataPro[i].taxes}</td>
            <td>${dataPro[i].ads}</td>
            <td>${dataPro[i].discount}</td>
            <td>${dataPro[i].total}</td>
            <th>${dataPro[i].category}</td>
            <td><button id="update" onclick = "updateData(${i})">update</button></td>
            <td><button onclick = "deleteData(${i})" id="delete">delete</button></td>
            </tr> `;
      }
    }
  }
  document.getElementById("tbody").innerHTML = table;
}
////////////////Input AND OUTPUT///////////
// وظيفة التنقل بين الأقسام
// function showSection(sectionId) {
//     // إخفاء جميع الأقسام
//     document.getElementById('inputSection').style.display = 'none';
//     document.getElementById('outputSection').style.display = 'none';

//     // إظهار القسم المطلوب
//     document.getElementById(sectionId).style.display = 'block';

//     // تغيير شكل الأزرار
//     document.getElementById('navInputBtn').classList.remove('active');
//     document.getElementById('navOutputBtn').classList.remove('active');

//     if(sectionId === 'inputSection') {
//         document.getElementById('navInputBtn').classList.add('active');
//     } else {
//         document.getElementById('navOutputBtn').classList.add('active');
//     }
// }

// function showSection(sectionId) {
//     // إخفاء كل الأقسام
//     document.getElementById('inputSection').style.display = 'none';
//     document.getElementById('outputSection').style.display = 'none';

//     // إظهار القسم المختار
//     document.getElementById(sectionId).style.display = 'block';

//     // تحديث شكل أزرار التنقل
//     document.getElementById('navInputBtn').classList.toggle('active', sectionId === 'inputSection');
//     document.getElementById('navOutputBtn').classList.toggle('active', sectionId === 'outputSection');
// }

// التأكد من تشغيل Input كواجهة أساسية تحتوي على كل الحقول عند فتح الصفحة
// window.onload = function() {
//     showSection('inputSection');
//     showData(); // عرض الجدول داخل قسم Input
// }

// وظيفة التبديل بين القائمة والصفحة الفارغة
function showSection(sectionId) {
  if (sectionId === "inputSection") {
    document.getElementById("inputSection").style.display = "block";
    document.getElementById("outputSection").style.display = "none";

    // ألوان الأزرار للتوضيح
    document.getElementById("navInputBtn").style.background = "#147cf3";
    document.getElementById("navOutputBtn").style.background = "#333";
  } else {
    document.getElementById("inputSection").style.display = "none";
    document.getElementById("outputSection").style.display = "block";

    document.getElementById("navInputBtn").style.background = "#333";
    document.getElementById("navOutputBtn").style.background = "#147cf3";
  }
}

// تشغيل وضع Input تلقائياً عند فتح الصفحة
window.onload = function () {
  showSection("inputSection");
};

/////////////////////////////////////////////////////////////////
/////////////////////////////OUTPUT/////////////////////////////
///////////////////////////////////////////////////////////////
// تحديد العناصر من HTML
// --- العناصر الخاصة بقسم المخرجات الجديد (OUT) ---
let outTitle = document.getElementById("name");
let outAmount = document.getElementById("amunt"); // تأكد من مطابقة id في HTML
let outDetail = document.getElementById("detail");
let outSubmit = document.getElementById("submit out");
let outRecords = document.getElementById("records");
let outremoveAllBtn = document.getElementById("removeAll");

let outMood = "create";
let outTmp;

// 1. وظيفة الحفظ (Create Product)
let outDataPro;
if (localStorage.outProduct != null) {
  outDataPro = JSON.parse(localStorage.outProduct);
} else {
  outDataPro = [];
}

outSubmit.onclick = function () {
  let newOutPro = {
  name: outTitle.value,
  amount: outAmount.value,
  detail: outDetail.value,
  Date: new Date().toLocaleString("en-GB", { 
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true // اجعلها false إذا كنت تريد نظام 24 ساعة
}).replace(/(\d+)\/(\d+)\/(\d+),/, "$3/$2/$1")
};


  if (outTitle.value != "" && outAmount.value != "") {
    if (outMood === "create") {
      outDataPro.push(newOutPro);
    } else {
      outDataPro[outTmp] = newOutPro;
      outMood = "create";
      outSubmit.innerHTML = "SAVE";
    }
    clearOutData();
  }

  // حفظ في localStorage
  localStorage.setItem("outProduct", JSON.stringify(outDataPro));
  showOutData();
};

// 2. مسح الحقول بعد الحفظ
function clearOutData() {
  outTitle.value = "";
  outAmount.value = "";
  outDetail.value = "";
}

// 3. عرض البيانات في الجدول
function showOutData() {
  let table = "";
  for (let i = 0; i < outDataPro.length; i++) {
    table += `
        <tr>
            <td>${i + 1}</td>
            <td>${outDataPro[i].name}</td>
            <td>${outDataPro[i].amount}</td>
            <td>${outDataPro[i].detail}</td>
            <td>${
              outDataPro[i].amount
            }</td> 
            <td><small style="color: #fff; font-size: 12px; display: black; margin-top: 5px;">
            🕒 ${outDataPro[i].Date ? outDataPro[i].Date : "UNKNOWN"}

            </small></td>
            <td><button onclick="updateOutData(${i})" id="update">تعديل</button></td>
            <td><button onclick="deleteOutData(${i})" id="delete">حذف</button></td>
        </tr>
        `;
  }
  outRecords.innerHTML = table;

  // إظهار زر حذف الكل إذا وجد بيانات
  if (outDataPro.length > 0) {
    outremoveAllBtn.innerHTML = `
    <button onclick="exportOutToPDF()" style="background-color: #d09228; margin-top: 10px;">Download PDF Report</button>
    <button onclick="removeAllOut()" style="background-color: #e76161ff; margin-top: 10px;">Delete All (${outDataPro.length})</button>
        `;
  } else {
    outremoveAllBtn.innerHTML = "";
  }
}

// 4. حذف عنصر واحد
function deleteOutData(i) {
  outDataPro.splice(i, 1);
  localStorage.outProduct = JSON.stringify(outDataPro);
  showOutData();
}

// 5. حذف الكل
function removeAllOut() {
  if (confirm("هل تريد حذف كافة السجلات؟")){
  localStorage.removeItem("outProduct");
  outDataPro.splice(0);
  showOutData();
}
}

// 6. التحديث (Update)
function updateOutData(i) {
  outTitle.value = outDataPro[i].name;
  outAmount.value = outDataPro[i].amount;
  outDetail.value = outDataPro[i].detail;
  outSubmit.innerHTML = "UPDATE";
  outMood = "update";
  outTmp = i;
  scroll({
    top: 0,
    behavior: "smooth",
  });
}

// تشغيل عرض البيانات عند تحميل الصفحة
showOutData();

function exportOutToPDF() {
    if (typeof html2pdf === 'undefined') {
        console.error("Library html2pdf not found");
        alert("عذراً، مكتبة PDF غير محملة");
        return;
    }

    // 1. إعداد التاريخ والوقت الحالي لعنوان التقرير
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    // let hours = now.getHours();
    // const minutes = String(now.getMinutes()).padStart(2, '0');
    // const ampm = hours >= 12 ? 'PM' : 'AM';
    // hours = hours % 12;
    // hours = hours ? hours : 12; 

  // تنسيق الوقت (12 ساعة مع AM/PM)
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // تحويل الساعة 0 إلى 12

    
    const formattedDateTime = `${year}/${month}/${day} - ${hours}:${minutes} ${ampm}`;
    const fileName = `Out_Report_${year}-${month}-${day}.pdf`;

    // 2. حساب إجمالي المبالغ وبناء الصفوف
    let totalExpenses = 0; 
    let tableBodyHtml = "";

    outDataPro.forEach((item, index) => {
        const amountValue = Number(item.amount) || 0;
        totalExpenses += amountValue;

        // جلب التاريخ المخزن في العنصر (نفس المنطق المستخدم في جدول العرض)
        const itemDate = item.Date || "UNKNOWN";

      //   const regDate = product.date
      // ? product.date
      // : product.Date
      // ? product.Date
      // : "N/A";

        tableBodyHtml += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${index + 1}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${item.name}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd; color: #d32f2f; font-weight: bold;">${amountValue.toFixed(2)}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-size: 11px;">${item.detail || "---"}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd; font-size: 10px; color: #555;">${itemDate}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${amountValue.toFixed(2)}</td>
            </tr>
        `;
    });

    // 3. إنشاء تصميم التقرير
    const element = document.createElement('div');
    element.innerHTML = `
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; background: white;">
            <div style="text-align: center; border-bottom: 3px solid #f51d1d; padding-bottom: 20px; margin-bottom: 20px;">
                <h1 style="color: #f51d1d; margin: 0; text-transform: uppercase;">تقرير سجل المخرجات (OUT)</h1>
                <p style="color: #666; margin: 5px 0; direction: ltr;">Generated on: ${formattedDateTime}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; direction: rtl;">
                <thead>
                    <tr style="background-color: #333; color: white;">
                        <th style="padding: 12px; border: 1px solid #222; width: 40px;">#</th>
                        <th style="padding: 12px; border: 1px solid #222;">الاسم</th>
                        <th style="padding: 12px; border: 1px solid #222;">المبلغ</th>
                        <th style="padding: 12px; border: 1px solid #222;">التفاصيل</th>
                        <th style="padding: 12px; border: 1px solid #222;">التاريخ/الوقت</th>
                        <th style="padding: 12px; border: 1px solid #222;">الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableBodyHtml}
                </tbody>
                <tfoot>
                    <tr style="background-color: #f1f1f1; font-weight: bold;">
                        <td colspan="2" style="padding: 15px; border: 1px solid #ddd; text-align: left;">إجمالي المبلغ الكلي:</td>
                        <td colspan="4" style="padding: 15px; border: 1px solid #ddd; text-align: center; color: #f51d1d; font-size: 18px;">${totalExpenses.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
            
            <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee; padding-top: 10px;">
                <p>البرطي- سجل المخرجات</p>
            </div>
        </div>
    `;

    // 4. إعدادات التصدير
    const opt = {
        margin:       [10, 10, 10, 10],
        filename:     fileName,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}