type PasswordRequirement = {
  label: string;
  valid: boolean;
};

type PasswordRequirementsProps = {
  requirements: PasswordRequirement[];
};

export default function PasswordRequirements({
  requirements,
}: PasswordRequirementsProps) {
  return (
    <div className="space-y-1 pt-1">
      {requirements.map((requirement) => (
        <p
          key={requirement.label}
          className={`text-xs ${
            requirement.valid ? "text-green-600" : "text-red-600"
          }`}
        >
          {requirement.valid ? "✓" : "✕"} {requirement.label}
        </p>
      ))}
    </div>
  );
}