import { Redirect, useRouter } from "expo-router";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
// TEST PUSH 123
import {
  Alert,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../lib/firebase";

import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

export default function Dashboard() {
  // 🔒 منع فتح الداشبورد على الويب (Netlify)
  if (Platform.OS === "web") {
    return <Redirect href="/" />;
  }

  const router = useRouter();

  const [repairs, setRepairs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    alternatePhone: "",
    deviceType: "",
    brand: "",
    model: "",
    serialNumber: "",
    accessories: "",
    problem: "",
    diagnosis: "",
    technician: "",
    estimatedPrice: "",
    finalPrice: "",
    notes: "",
  });

  const fetchRepairs = async () => {
    const snapshot = await getDocs(collection(db, "repairs"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setRepairs(data);
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("تنبيه", "يجب السماح باستخدام الكاميرا");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const addRepair = async () => {
    if (!form.customerName || !form.phone || !form.deviceType) {
      Alert.alert("تنبيه", "الرجاء إدخال البيانات الأساسية");
      return;
    }

    const snapshot = await getDocs(collection(db, "repairs"));
    const orderNumber = 1000 + snapshot.size + 1;

    let imageBase64 = null;

    if (image) {
      try {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          image,
          [{ resize: { width: 800 } }],
          {
            compress: 0.6,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true,
          }
        );

        imageBase64 = `data:image/jpeg;base64,${manipulatedImage.base64}`;
      } catch (error) {
        Alert.alert("خطأ", "فشل معالجة الصورة");
      }
    }

    await addDoc(collection(db, "repairs"), {
      orderNumber,
      ...form,
      imageBase64,
      estimatedPrice: Number(form.estimatedPrice) || 0,
      finalPrice: Number(form.finalPrice) || 0,
      paymentStatus: "Unpaid",
      status: "Received",
      priority: "Normal",
      warrantyDays: 0,
      createdAt: new Date(),
      deliveryDate: null,
    });

    setForm({
      customerName: "",
      phone: "",
      alternatePhone: "",
      deviceType: "",
      brand: "",
      model: "",
      serialNumber: "",
      accessories: "",
      problem: "",
      diagnosis: "",
      technician: "",
      estimatedPrice: "",
      finalPrice: "",
      notes: "",
    });

    setImage(null);
    fetchRepairs();
  };

  const totalOrders = repairs.length;

  const totalRevenue = repairs
    .filter((r) => r.paymentStatus === "Paid")
    .reduce((sum, r) => sum + (r.finalPrice || 0), 0);

  const filteredRepairs = repairs.filter((item) =>
    item.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    item.phone?.includes(search) ||
    String(item.orderNumber).includes(search)
  );

  const renderInput = (placeholder: string, key: string) => (
    <TextInput
      placeholder={placeholder}
      value={(form as any)[key]}
      onChangeText={(value) => handleChange(key, value)}
      style={styles.input}
    />
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsBox}>
        <Text style={styles.statText}>📊 عدد الطلبات: {totalOrders}</Text>
        <Text style={styles.statText}>
          💰 الأرباح (المدفوع فقط): {totalRevenue} ريال
        </Text>
      </View>

      <Text style={styles.title}>إضافة طلب صيانة جديد</Text>

      {renderInput("اسم العميل", "customerName")}
      {renderInput("رقم الجوال", "phone")}
      {renderInput("رقم بديل", "alternatePhone")}
      {renderInput("نوع الجهاز", "deviceType")}
      {renderInput("الماركة", "brand")}
      {renderInput("الموديل", "model")}
      {renderInput("الرقم التسلسلي", "serialNumber")}
      {renderInput("الملحقات", "accessories")}
      {renderInput("وصف المشكلة", "problem")}
      {renderInput("التشخيص", "diagnosis")}
      {renderInput("اسم الفني", "technician")}
      {renderInput("السعر المتوقع", "estimatedPrice")}
      {renderInput("السعر النهائي", "finalPrice")}
      {renderInput("ملاحظات إضافية", "notes")}

      <TouchableOpacity onPress={takePhoto} style={styles.imageButton}>
        <Text style={styles.imageButtonText}>📷 التقاط صورة</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
        <Text style={styles.imageButtonText}>🖼 اختيار من المعرض</Text>
      </TouchableOpacity>

      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: "100%", height: 200, borderRadius: 10, marginBottom: 10 }}
        />
      )}

      <TouchableOpacity style={styles.saveButton} onPress={addRepair}>
        <Text style={styles.saveButtonText}>حفظ الطلب</Text>
      </TouchableOpacity>

      <TextInput
        placeholder="بحث برقم الطلب أو الاسم أو الجوال"
        value={search}
        onChangeText={setSearch}
        style={styles.input}
      />

      <FlatList
        scrollEnabled={false}
        data={filteredRepairs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/repair/${item.id}` as any)}
          >
            <View style={styles.card}>
              <Text style={styles.orderNumber}>
                🧾 رقم الطلب: {item.orderNumber}
              </Text>
              <Text>👤 {item.customerName}</Text>
              <Text>📱 {item.phone}</Text>
              <Text>
                📦 {item.deviceType} - {item.brand} {item.model}
              </Text>
              <Text>💰 {item.finalPrice} ريال</Text>
              <Text>📌 {item.status}</Text>
              <Text>💳 {item.paymentStatus}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </ScrollView>
  );
  
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 22,
    marginBottom: 15,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "#16a34a",
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
  },
  saveButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
  },
  orderNumber: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  statsBox: {
    backgroundColor: "#e0f2fe",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  statText: {
    fontWeight: "bold",
  },
  imageButton: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});