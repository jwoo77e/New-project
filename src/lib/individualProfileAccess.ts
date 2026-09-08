const INDIVIDUAL_PROFILE_ACCESS_CODE_POINTS = [52, 57, 55, 57] as const;

export function isIndividualProfileAccessCode(value: string): boolean {
  if (value.length !== INDIVIDUAL_PROFILE_ACCESS_CODE_POINTS.length) return false;

  return [...value].every(
    (character, index) =>
      character.charCodeAt(0) === INDIVIDUAL_PROFILE_ACCESS_CODE_POINTS[index],
  );
}
