import * as Print from "expo-print";
import { useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { db } from "../../lib/firebase";

export default function RepairDetails() {
  const { id } = useLocalSearchParams();
  const [repair, setRepair] = useState<any>(null);
  const [showImage, setShowImage] = useState(false);

  const SHOP_NAME = "مركز الصيانة الذكي";
  const SHOP_PHONE = "966500000000";

  // =========================
  // تحميل الطلب
  // =========================
  const fetchRepair = async () => {
    if (!id) return;

    const snap = await getDoc(doc(db, "repairs", id as string));
    if (snap.exists()) {
      setRepair({ id: snap.id, ...snap.data() });
    }
  };

  useEffect(() => {
    fetchRepair();
  }, []);

  // =========================
  // تحديث الحالة
  // =========================
  const updateStatus = async (status: string) => {
    await updateDoc(doc(db, "repairs", id as string), { status });
    fetchRepair();
  };

  const updatePayment = async (paymentStatus: string) => {
    await updateDoc(doc(db, "repairs", id as string), {
      paymentStatus,
    });
    fetchRepair();
  };

  // =========================
  // إنشاء PDF
  // =========================
  const generatePDF = async () => {
    if (!repair) return;

    const html = `
      <html>
        <body style="font-family: Arial; direction: rtl; padding: 30px;">
          <h2 style="text-align:center;">${SHOP_NAME}</h2>
          <p style="text-align:center;">هاتف: ${SHOP_PHONE}</p>
          <hr/>

          <h3 style="text-align:center;">فاتورة صيانة</h3>

          <p><b>رقم الطلب:</b> ${repair.orderNumber}</p>
          <p><b>اسم العميل:</b> ${repair.customerName}</p>
          <p><b>الجوال:</b> ${repair.phone}</p>
          <p><b>نوع الجهاز:</b> ${repair.deviceType}</p>
          <p><b>المشكلة:</b> ${repair.problem}</p>
          <p><b>السعر النهائي:</b> ${repair.finalPrice} ريال</p>
          <p><b>الحالة:</b> ${repair.status}</p>
          <p><b>حالة الدفع:</b> ${repair.paymentStatus}</p>

          <hr/>
          <p style="text-align:center;">شكراً لتعاملكم معنا</p>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });

    if (Platform.OS === "web") {
      window.open(uri, "_blank");
    } else {
      await Sharing.shareAsync(uri);
    }
  };

  if (!repair) {
    return <Text style={{ padding: 20 }}>جاري التحميل...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        تفاصيل الطلب #{repair.orderNumber}
      </Text>

      <View style={styles.card}>
        <Text>👤 العميل: {repair.customerName}</Text>
        <Text>📱 الجوال: {repair.phone}</Text>
        <Text>📦 الجهاز: {repair.deviceType}</Text>
        <Text>🏷 الماركة: {repair.brand}</Text>
        <Text>🔢 الموديل: {repair.model}</Text>
        <Text>🔐 الرقم التسلسلي: {repair.serialNumber}</Text>
        <Text>🛠 المشكلة: {repair.problem}</Text>
        <Text>🧪 التشخيص: {repair.diagnosis}</Text>
        <Text>👨‍🔧 الفني: {repair.technician}</Text>
        <Text>💰 السعر: {repair.finalPrice} ريال</Text>
        <Text>📌 الحالة: {repair.status}</Text>
        <Text>💳 الدفع: {repair.paymentStatus}</Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => updateStatus("Completed")}
        >
          <Text style={styles.buttonText}>إنهاء الطلب</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => updatePayment("Paid")}
        >
          <Text style={styles.buttonText}>تأكيد الدفع</Text>
        </TouchableOpacity>

        {/* زر عرض الصورة */}
        {repair.imageBase64 && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#2563eb" }]}
            onPress={() => setShowImage(true)}
          >
            <Text style={styles.buttonText}>عرض صورة الجهاز</Text>
          </TouchableOpacity>
        )}

        {/* زر PDF */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#7c3aed" }]}
          onPress={generatePDF}
        >
          <Text style={styles.buttonText}>استخراج PDF</Text>
        </TouchableOpacity>
      </View>

      {/* Modal عرض الصورة */}
      <Modal visible={showImage} transparent={true}>
        <View style={styles.modalContainer}>
          <Image
            source={{ uri: repair.imageBase64 }}
            style={styles.fullImage}
          />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowImage(false)}
          >
            <Text style={styles.buttonText}>إغلاق</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f3f4f6",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
  },
  buttons: {
    gap: 10,
  },
  button: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%",
    height: "70%",
    resizeMode: "contain",
    borderRadius: 10,
  },
  closeButton: {
    backgroundColor: "#dc2626",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
});
