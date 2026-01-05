import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { fetchClinicalTrials } from "../api/clinicalTrials";
import { useQuery } from "@tanstack/react-query";

export default function ClinicalTrialsScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["clinicalTrials", "sci"],
    queryFn: () => fetchClinicalTrials("spinal cord injury"),
  });

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return <Text>Error loading trials</Text>;
  }

  return (
    <FlatList
      data={data.studies}
      keyExtractor={(item) => item.protocolSection.identificationModule.nctId}
      renderItem={({ item }) => (
        <View style={{ padding: 12 }}>
          <Text style={{ fontWeight: "600" }}>
            {item.protocolSection.identificationModule.briefTitle}
          </Text>
          <Text>
            {item.protocolSection.statusModule.overallStatus}
          </Text>
        </View>
      )}
    />
  );
}