import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SHOP_PHONE = "966500000000"; // 👈 ضع رقم المحل بصيغة دولية بدون +

export default function Track() {
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [repair, setRepair] = useState<any>(null);
  const [error, setError] = useState("");

  const searchOrder = async () => {
    if (!orderNumber) return;

    setLoading(true);
    setError("");
    setRepair(null);

    try {
      const q = query(
        collection(db, "repairs"),
        where("orderNumber", "==", orderNumber)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("لم يتم العثور على الطلب");
      } else {
        setRepair(querySnapshot.docs[0].data());
      }
    } catch (err) {
      setError("حدث خطأ أثناء البحث");
    }

    setLoading(false);
  };

  const openWhatsApp = () => {
    if (!repair) return;

    const message = `مرحبا، اريد الاستفسار عن طلب رقم ${repair.orderNumber}`;
    const url = `https://wa.me/${SHOP_PHONE}?text=${encodeURIComponent(
      message
    )}`;

    Linking.openURL(url);
  };

  const callShop = () => {
    Linking.openURL(`tel:+${SHOP_PHONE}`);
  };

  const getStatusColor = () => {
    switch (repair?.status) {
      case "مكتمل":
        return "#2ecc71";
      case "قيد الصيانة":
        return "#f39c12";
      case "بانتظار القطعة":
        return "#3498db";
      default:
        return "#e74c3c";
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>متابعة الطلب</Text>

      <TextInput
        style={styles.input}
        placeholder="ادخل رقم الطلب"
        value={orderNumber}
        onChangeText={setOrderNumber}
      />

      <TouchableOpacity style={styles.button} onPress={searchOrder}>
        <Text style={styles.buttonText}>بحث</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#000" />}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {repair && (
        <View style={styles.card}>
          <Text style={styles.label}>رقم الطلب:</Text>
          <Text style={styles.value}>{repair.orderNumber}</Text>

          <Text style={styles.label}>اسم العميل:</Text>
          <Text style={styles.value}>{repair.customerName}</Text>

          <Text style={styles.label}>الجهاز:</Text>
          <Text style={styles.value}>{repair.deviceType}</Text>

          <Text style={styles.label}>العطل:</Text>
          <Text style={styles.value}>{repair.problem}</Text>

          <Text style={styles.label}>الحالة:</Text>
          <Text style={[styles.status, { backgroundColor: getStatusColor() }]}>
            {repair.status}
          </Text>

          {/* 🔥 أزرار التواصل */}
          <View style={styles.contactRow}>
            <TouchableOpacity
              style={[styles.contactButton, { backgroundColor: "#25D366" }]}
              onPress={openWhatsApp}
            >
              <Text style={styles.contactText}>واتساب</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactButton, { backgroundColor: "#2c3e50" }]}
              onPress={callShop}
            >
              <Text style={styles.contactText}>اتصال</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f6fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#2c3e50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    elevation: 3,
  },
  label: {
    fontWeight: "bold",
    marginTop: 8,
  },
  value: {
    marginBottom: 5,
  },
  status: {
    color: "#fff",
    padding: 8,
    borderRadius: 6,
    textAlign: "center",
    marginTop: 5,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  contactButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  contactText: {
    color: "#fff",
    fontWeight: "bold",
  },
});