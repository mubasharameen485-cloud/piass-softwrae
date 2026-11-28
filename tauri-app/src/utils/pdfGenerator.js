import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateStudentResultPDF = async (studentData, examData, subjectsList) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // 1. Load Official Letterhead from public folder
  try {
    const imgData = await loadImage('/piass-letterhead.png');
    doc.addImage(imgData, 'PNG', 0, 0, 210, 297);
  } catch (err) {
    console.warn('Letterhead image not found in public folder, proceeding with clean white background.', err);
  }

  // 2. Student & Exam Details Header (Shifted further down below letterhead header banner: ~65mm)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(6, 43, 85); // PIASS Navy #062b55
  doc.text('STATEMENT OF MARKS', 105, 63, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(7, 131, 67); // PIASS Green #078343
  doc.text(`${examData.term_type} Examination | Academic Year ${examData.academic_year}`, 105, 69, { align: 'center' });

  // 3. Student Info Box Background (Y: 74 to 104)
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 74, 182, 28, 2, 2, 'FD');

  // Student Photo inside PDF (if available)
  if (studentData.image_url) {
    try {
      const studentImgData = await loadImage(studentData.image_url);
      doc.addImage(studentImgData, 'JPEG', 17, 76, 20, 24);
      doc.setDrawColor(6, 43, 85);
      doc.rect(17, 76, 20, 24, 'S');
    } catch (e) {
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('No Photo', 20, 90);
    }
  } else {
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('No Photo', 20, 90);
    doc.setDrawColor(203, 213, 225);
    doc.rect(17, 76, 20, 24, 'S');
  }

  // Student Info Text (Shifted right to accommodate photo)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  const name = studentData.full_name || studentData.student_name || 'N/A';
  const rollNo = studentData.roll_no || 'N/A';
  const fatherName = studentData.father_name || 'N/A';
  const program = `${examData.category} (${examData.semester})`;

  doc.text(`Student Name : ${name}`, 42, 83);
  doc.text(`Roll Number  : ${rollNo}`, 125, 83);
  doc.text(`Father Name  : ${fatherName}`, 42, 93);
  doc.text(`Program      : ${program}`, 115, 93);

  // 4. Calculate Totals & Percentages from actual marks data
  let totalMaxMarks = 0;
  let totalObtainedMarks = 0;

  const tableBody = subjectsList.map((sub) => {
    // Robust key matching for marks_data (matches subject name or id)
    const marksBag = studentData.marks_data || {};
    const obtained = parseFloat(
      marksBag[sub.subject_name] ?? 
      marksBag[sub.id] ?? 
      marksBag[sub.subject_code] ?? 
      0
    ) || 0;
    
    const max = parseFloat(sub.total_marks) || 100;
    totalMaxMarks += max;
    totalObtainedMarks += obtained;
    const isPass = obtained >= (max * 0.4);

    return [
      sub.subject_name,
      max.toString(),
      obtained.toString(),
      isPass ? 'PASS' : 'FAIL'
    ];
  });

  const percentage = totalMaxMarks > 0 ? ((totalObtainedMarks / totalMaxMarks) * 100).toFixed(2) : '0.00';
  
  let grade = 'F';
  let gpa = '0.0';
  if (percentage >= 85) { grade = 'A+'; gpa = '4.0'; }
  else if (percentage >= 75) { grade = 'A'; gpa = '3.7'; }
  else if (percentage >= 65) { grade = 'B'; gpa = '3.0'; }
  else if (percentage >= 50) { grade = 'C'; gpa = '2.0'; }
  else if (percentage >= 40) { grade = 'D'; gpa = '1.0'; }

  // 5. Generate AutoTable for Subjects & Marks (Shifted down below info box)
  autoTable(doc, {
    startY: 107,
    head: [['Subject Name', 'Total Marks', 'Obtained Marks', 'Status']],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: [6, 43, 85], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 82 },
      1: { cellWidth: 33, halign: 'center' },
      2: { cellWidth: 34, halign: 'center' },
      3: { cellWidth: 33, halign: 'center', fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 }
  });

  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 6 : 140;

  // 6. Summary Box (Total Marks, Percentage, GPA)
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, finalY, 182, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(6, 43, 85);
  doc.text(`Total Marks: ${totalObtainedMarks} / ${totalMaxMarks}`, 18, finalY + 10);
  doc.text(`Percentage: ${percentage}%`, 85, finalY + 10);
  doc.text(`Estimated GPA: ${gpa} (Grade: ${grade})`, 140, finalY + 10);

  // 7. Signatures Footer (Positioned safely above the bottom green/navy wave footer banner)
  const footerY = 255;
  doc.setLineWidth(0.5);
  doc.setDrawColor(150, 150, 150);
  
  doc.line(14, footerY, 70, footerY);
  doc.line(140, footerY, 196, footerY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text('Prepared By', 14, footerY + 6);
  doc.text('Controller of Examinations Stamp', 140, footerY + 6);

  // 8. Save PDF File
  doc.save(`Result_${rollNo}_${examData.term_type}.pdf`);
};

const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (err) => reject(err);
  });
};